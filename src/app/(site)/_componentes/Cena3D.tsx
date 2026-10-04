'use client'

/**
 * O balcão 3D do topo: objetos reais (fotogrametria) dos três mundos que
 * atendemos a flutuar à volta do título — croissant e bolo (restaurantes e
 * cafés), um carro (stands), relógio e maçã (lojas e mercados) — mais
 * moedas. Cada um pode ser agarrado e atirado; volta ao lugar com uma mola.
 *
 * Modelos em /public/media/3d, comprimidos (meshopt + WebP). Créditos no
 * rodapé do site: Poly Haven (CC0) e Khronos "Car Concept" (CC-BY 4.0).
 *
 * Desempenho: carrega depois do texto; o toque usa esferas invisíveis em vez
 * das malhas; pára fora do ecrã e com a aba escondida; respeita
 * prefers-reduced-motion; sem WebGL, não desenha.
 */
import { useEffect, useRef } from 'react'
import type * as TresTipos from 'three'

type Props = {
  aoMedir?: (fps: number) => void
  aoPronto?: () => void
  className?: string
}

type Corpo = {
  grupo: TresTipos.Group
  alvo: TresTipos.Mesh
  ancora: TresTipos.Vector3
  vel: TresTipos.Vector3
  giro: TresTipos.Vector3
  giroBase: TresTipos.Vector3
  raio: number
  fase: number
  agarrado: boolean
}

type Lugar = [number, number]
type Peca = {
  /** Ficheiro em /media/3d, ou 'moeda' (feita por código). */
  modelo: string
  deitado: Lugar
  empe: Lugar
  z: number
  /** Tamanho (maior dimensão) em unidades da cena, num ecrã largo. */
  tamanho: number
  rotacao: [number, number, number]
  giro: [number, number]
}

const PECAS: Peca[] = [
  { modelo: 'strawberry_chocolate_cake', deitado: [-0.78, 0.44], empe: [-0.55, 0.74], z: 0, tamanho: 2.7, rotacao: [0.5, 0.2, 0], giro: [0, 0.004] },
  { modelo: 'carro', deitado: [0.7, -0.5], empe: [0.42, -0.74], z: 0.6, tamanho: 4.6, rotacao: [0.32, -0.9, 0], giro: [0, 0.0035] },
  { modelo: 'croissant', deitado: [0.8, 0.5], empe: [0.6, 0.8], z: -0.4, tamanho: 2.6, rotacao: [0.6, 0.4, 0.2], giro: [0.002, 0.003] },
  { modelo: 'food_apple_01', deitado: [-0.78, -0.5], empe: [-0.6, -0.72], z: 0.4, tamanho: 1.9, rotacao: [0.2, 0, 0.1], giro: [0.001, 0.005] },
  { modelo: 'digital_wrist_watch', deitado: [0.08, -0.84], empe: [0.06, 0.93], z: 0.5, tamanho: 2.3, rotacao: [1.2, 0.3, 0.15], giro: [0.0025, 0.003] },
  { modelo: 'moeda', deitado: [-0.3, 0.72], empe: [-0.88, 0.45], z: -2, tamanho: 1.1, rotacao: [1.2, 0.4, 0], giro: [0.004, 0.006] },
  { modelo: 'moeda', deitado: [0.96, -0.04], empe: [0.88, -0.45], z: -1.5, tamanho: 0.9, rotacao: [0.4, 1.2, 0], giro: [0.005, 0.004] },
  { modelo: 'moeda', deitado: [-0.42, -0.86], empe: [-0.15, -0.93], z: -1, tamanho: 0.8, rotacao: [0.9, 0.2, 0.4], giro: [0.006, 0.003] },
]

export default function Cena3D({ aoMedir, aoPronto, className }: Props) {
  const tela = useRef<HTMLCanvasElement>(null)
  const medir = useRef(aoMedir)
  const pronto = useRef(aoPronto)
  useEffect(() => {
    medir.current = aoMedir
    pronto.current = aoPronto
  })

  useEffect(() => {
    const canvas = tela.current
    if (!canvas) return
    let parar = () => {}
    let cancelado = false

    ;(async () => {
      const THREE = await import('three')
      const [{ RoomEnvironment }, { GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
        import('three/examples/jsm/environments/RoomEnvironment.js'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/libs/meshopt_decoder.module.js'),
      ])
      if (cancelado) return

      let renderer: TresTipos.WebGLRenderer
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
      } catch {
        canvas.style.display = 'none'
        return
      }
      const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const pequeno = window.matchMedia('(max-width: 760px)').matches
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, pequeno ? 1.5 : 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1

      const cena = new THREE.Scene()
      const pmrem = new THREE.PMREMGenerator(renderer)
      cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture
      cena.environmentIntensity = 0.9

      const camara = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
      camara.position.set(0, 0, 16)

      // Luz de estúdio com o pôr do sol: chave quente, contraluz rosa, rebatida verde-água.
      const chave = new THREE.DirectionalLight('#ffe2c0', 2.4)
      chave.position.set(5, 8, 9)
      const contra = new THREE.DirectionalLight('#ff4f8b', 2.2)
      contra.position.set(-9, 1, -6)
      const recorte = new THREE.DirectionalLight('#ffb020', 1.4)
      recorte.position.set(8, -3, -5)
      const agua = new THREE.PointLight('#3dd6c3', 22, 30)
      agua.position.set(0, -7, 5)
      cena.add(chave, contra, recorte, agua)

      // ---------------------------------------------------------------------
      // Poeira na luz: grãos que derivam devagar; de vez em quando um faísca.
      // Os de trás são maiores e mais suaves (bokeh); os da frente, finos.
      // ---------------------------------------------------------------------
      const totalPoeira = pequeno ? 260 : 560
      const posicoes = new Float32Array(totalPoeira * 3)
      const atributos = new Float32Array(totalPoeira * 4) // tamanho, fase, velocidade, faísca
      const cores = new Float32Array(totalPoeira * 3)
      const paleta = [
        new THREE.Color('#ffd79a'),
        new THREE.Color('#fff1dc'),
        new THREE.Color('#ffb020'),
        new THREE.Color('#ff7a59'),
        new THREE.Color('#ff4f8b'),
        new THREE.Color('#3dd6c3'),
      ]
      const pesos = [0.4, 0.36, 0.12, 0.05, 0.04, 0.03]
      for (let i = 0; i < totalPoeira; i++) {
        const z = -12 + Math.random() * 18 // de bem atrás até perto da câmara
        posicoes[i * 3] = (Math.random() - 0.5) * 24
        posicoes[i * 3 + 1] = (Math.random() - 0.5) * 15
        posicoes[i * 3 + 2] = z
        atributos[i * 4] = 0.5 + Math.random() * 1.2
        atributos[i * 4 + 1] = Math.random() * 100
        atributos[i * 4 + 2] = 0.15 + Math.random() * 0.5
        atributos[i * 4 + 3] = Math.random() < 0.08 ? 1 : 0
        let r = Math.random()
        let k = 0
        while (k < pesos.length - 1 && (r -= pesos[k]!) > 0) k++
        cores.set([paleta[k]!.r, paleta[k]!.g, paleta[k]!.b], i * 3)
      }
      const geoPoeira = new THREE.BufferGeometry()
      geoPoeira.setAttribute('position', new THREE.BufferAttribute(posicoes, 3))
      geoPoeira.setAttribute('dados', new THREE.BufferAttribute(atributos, 4))
      geoPoeira.setAttribute('cor', new THREE.BufferAttribute(cores, 3))
      const uniformes = {
        uTempo: { value: 0 },
        uEscala: { value: renderer.getPixelRatio() },
        uVento: { value: new THREE.Vector2() },
        uParado: { value: semMovimento ? 1 : 0 },
      }
      const matPoeira = new THREE.ShaderMaterial({
        uniforms: uniformes,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          attribute vec4 dados;
          attribute vec3 cor;
          uniform float uTempo;
          uniform float uEscala;
          uniform vec2 uVento;
          uniform float uParado;
          varying vec3 vCor;
          varying float vBrilho;
          varying float vSuave;
          void main() {
            float t = uTempo * (1.0 - uParado);
            vec3 p = position;
            // Deriva lenta, como poeira num raio de sol, e volta a entrar pelo outro lado.
            p.x += sin(t * 0.07 * dados.z + dados.y) * 1.6 + t * 0.12 * dados.z;
            p.y += cos(t * 0.09 * dados.z + dados.y * 1.3) * 1.1 + t * 0.05 * dados.z;
            p.x = mod(p.x + 12.0, 24.0) - 12.0;
            p.y = mod(p.y + 7.5, 15.0) - 7.5;
            // O ar mexe com o rato: os de perto mexem mais.
            float perto = smoothstep(-12.0, 6.0, p.z);
            p.xy += uVento * (0.4 + perto * 1.4);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            // Cintilar: uma pulsação suave e, nos grãos de faísca, um clarão curto.
            float pulso = 0.55 + 0.45 * sin(uTempo * (0.6 + dados.z * 2.0) + dados.y * 6.28);
            float faisca = dados.w * pow(max(0.0, sin(uTempo * 0.45 + dados.y * 3.7)), 40.0);
            vBrilho = pulso * 0.72 + faisca * 3.4;
            vCor = cor;
            // Atrás: maior e desfocado (bokeh); à frente: fino e nítido.
            vSuave = 1.0 - perto;
            float tamanho = dados.x * mix(1.0, 2.4, vSuave) * (1.0 + faisca * 1.6);
            gl_PointSize = tamanho * uEscala * (115.0 / -mv.z);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vCor;
          varying float vBrilho;
          varying float vSuave;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if (d > 0.5) discard;
            // Núcleo nítido para os da frente, disco macio para os de trás.
            float nucleo = smoothstep(0.5, mix(0.0, 0.32, vSuave), d);
            float halo = exp(-d * d * mix(26.0, 9.0, vSuave)) * 0.6;
            float a = (nucleo * mix(1.0, 0.22, vSuave) + halo * mix(1.0, 0.6, vSuave)) * vBrilho;
            gl_FragColor = vec4(vCor * a, a);
          }
        `,
      })
      const poeira = new THREE.Points(geoPoeira, matPoeira)
      poeira.frustumCulled = false
      cena.add(poeira)
      // O "vento" segue o rato com atraso.
      const ventoAlvo = new THREE.Vector2()
      const aoMoverJanela = (e: PointerEvent) => {
        ventoAlvo.set((e.clientX / window.innerWidth - 0.5) * 1.2, -(e.clientY / window.innerHeight - 0.5) * 0.8)
      }
      window.addEventListener('pointermove', aoMoverJanela, { passive: true })

      const ouro = new THREE.MeshPhysicalMaterial({ color: '#f4b43c', metalness: 1, roughness: 0.18, clearcoat: 0.6 })
      const alvoMaterial = new THREE.MeshBasicMaterial({ visible: false })
      const esferaAlvo = new THREE.SphereGeometry(0.5, 12, 8)

      function moeda() {
        const g = new THREE.Group()
        const perfil = [
          [0, -0.07],
          [0.46, -0.07],
          [0.5, -0.05],
          [0.5, 0.05],
          [0.46, 0.07],
          [0.4, 0.07],
          [0.38, 0.055],
          [0, 0.055],
        ].map(([x, y]) => new THREE.Vector2(x, y))
        const corpo = new THREE.Mesh(new THREE.LatheGeometry(perfil, 64), ouro)
        corpo.rotation.x = Math.PI / 2
        const serrilha = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.012, 6, 120), ouro)
        g.add(corpo, serrilha)
        return g
      }

      /** Centra o objeto e escala-o para o tamanho pedido. */
      function normalizar(objeto: TresTipos.Object3D, tamanho: number) {
        const caixa = new THREE.Box3().setFromObject(objeto)
        const dim = caixa.getSize(new THREE.Vector3())
        const centro = caixa.getCenter(new THREE.Vector3())
        const maior = Math.max(dim.x, dim.y, dim.z) || 1
        const s = tamanho / maior
        objeto.position.sub(centro.multiplyScalar(s))
        objeto.scale.multiplyScalar(s)
      }

      const corpos: Corpo[] = PECAS.map((p, i) => {
        const grupo = new THREE.Group()
        grupo.rotation.set(...p.rotacao)
        const alvo = new THREE.Mesh(esferaAlvo, alvoMaterial)
        alvo.scale.setScalar(p.tamanho * 0.9)
        grupo.add(alvo)
        grupo.visible = false
        cena.add(grupo)
        return {
          grupo,
          alvo,
          ancora: new THREE.Vector3(0, 0, p.z),
          vel: new THREE.Vector3(),
          giro: new THREE.Vector3(p.giro[0], p.giro[1], 0),
          giroBase: new THREE.Vector3(p.giro[0], p.giro[1], 0),
          raio: p.tamanho * 0.45,
          fase: i * 1.7,
          agarrado: false,
        }
      })

      // Cada objeto entra a crescer, com um pequeno ressalto.
      const entrando = new Map<Corpo, number>()

      // Carrega os modelos em paralelo; cada um aparece quando chega.
      const carregador = new GLTFLoader()
      carregador.setMeshoptDecoder(MeshoptDecoder)
      let aCarregar = PECAS.length
      const umAMenos = () => {
        aCarregar--
        if (aCarregar === 0) pronto.current?.()
      }
      PECAS.forEach((p, i) => {
        const c = corpos[i]!
        if (p.modelo === 'moeda') {
          const m = moeda()
          normalizar(m, p.tamanho)
          c.grupo.add(m)
          c.grupo.visible = true
          umAMenos()
          return
        }
        carregador.load(
          `/media/3d/${p.modelo}.glb`,
          (gltf) => {
            if (cancelado) return
            const modelo = gltf.scene
            normalizar(modelo, p.tamanho)
            c.grupo.add(modelo)
            c.grupo.visible = true
            c.grupo.scale.setScalar(0.001)
            entrando.set(c, performance.now())
            umAMenos()
          },
          undefined,
          umAMenos,
        )
      })

      // ---------------------------------------------------------------------
      // Posições em frações da área visível
      // ---------------------------------------------------------------------
      let escalaTela = 1
      const recolocar = (primeiraVez: boolean) => {
        const emPe = camara.aspect < 0.9
        const meiaAltura = Math.tan(THREE.MathUtils.degToRad(camara.fov / 2))
        escalaTela = Math.min(1.1, Math.max(0.5, (Math.min(camara.aspect, 1.7) * meiaAltura * camara.position.z) / 6.4)) * (emPe ? 0.82 : 1)
        PECAS.forEach((p, i) => {
          const c = corpos[i]!
          const [fx, fy] = emPe ? p.empe : p.deitado
          const mh = meiaAltura * (camara.position.z - p.z)
          c.ancora.set(fx * mh * camara.aspect, fy * mh, p.z)
          c.raio = p.tamanho * 0.45 * escalaTela
          if (!entrando.has(c)) c.grupo.scale.setScalar(escalaTela)
          if (primeiraVez) c.grupo.position.copy(c.ancora)
        })
      }

      // ---------------------------------------------------------------------
      // Agarrar e atirar
      // ---------------------------------------------------------------------
      const raio = new THREE.Raycaster()
      const ponteiro = new THREE.Vector2()
      const plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
      const ponto = new THREE.Vector3()
      let agarrado: Corpo | null = null
      const desvio = new THREE.Vector3()
      let ultimo = new THREE.Vector3()
      let ultimoT = 0

      const lerPonteiro = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect()
        ponteiro.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
        raio.setFromCamera(ponteiro, camara)
      }
      const corpoSob = () => {
        const hits = raio.intersectObjects(
          corpos.filter((c) => c.grupo.visible).map((c) => c.alvo),
          false,
        )
        return hits.length ? (corpos.find((c) => c.alvo === hits[0]!.object) ?? null) : null
      }
      const aoBaixar = (e: PointerEvent) => {
        lerPonteiro(e)
        const c = corpoSob()
        if (!c) return
        agarrado = c
        c.agarrado = true
        plano.constant = -c.grupo.position.z
        raio.ray.intersectPlane(plano, ponto)
        desvio.copy(c.grupo.position).sub(ponto)
        ultimo = c.grupo.position.clone()
        ultimoT = performance.now()
        canvas.setPointerCapture(e.pointerId)
        canvas.style.cursor = 'grabbing'
        e.preventDefault()
      }
      const aoMover = (e: PointerEvent) => {
        lerPonteiro(e)
        if (!agarrado) {
          canvas.style.cursor = corpoSob() ? 'grab' : 'default'
          return
        }
        if (raio.ray.intersectPlane(plano, ponto)) {
          const novo = ponto.add(desvio)
          const agora = performance.now()
          const dt = Math.max(16, agora - ultimoT) / 1000
          agarrado.vel.copy(novo).sub(ultimo).divideScalar(dt)
          agarrado.giro.set(-agarrado.vel.y * 0.004, agarrado.vel.x * 0.004, 0)
          agarrado.grupo.position.copy(novo)
          ultimo = novo.clone()
          ultimoT = agora
        }
      }
      const aoSoltar = (e: PointerEvent) => {
        if (agarrado) agarrado.agarrado = false
        agarrado = null
        canvas.style.cursor = 'default'
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
      }
      canvas.addEventListener('pointerdown', aoBaixar)
      canvas.addEventListener('pointermove', aoMover)
      canvas.addEventListener('pointerup', aoSoltar)
      canvas.addEventListener('pointercancel', aoSoltar)

      // ---------------------------------------------------------------------
      // Tamanho, visibilidade e ciclo
      // ---------------------------------------------------------------------
      let primeiroAjuste = true
      const ajustar = () => {
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        if (!w || !h) return
        renderer.setSize(w, h, false)
        camara.aspect = w / h
        camara.updateProjectionMatrix()
        recolocar(primeiroAjuste)
        primeiroAjuste = false
      }
      const observador = new ResizeObserver(ajustar)
      observador.observe(canvas)
      ajustar()

      let visivel = true
      const io = new IntersectionObserver(([e]) => {
        visivel = !!e?.isIntersecting
        if (visivel) pedir()
      })
      io.observe(canvas)

      let quadro = 0
      let anterior = performance.now()
      let quadros = 0
      let marco = anterior
      const tmp = new THREE.Vector3()

      const passo = (agora: number) => {
        quadro = 0
        const dt = Math.min(0.05, (agora - anterior) / 1000)
        anterior = agora
        const t = agora / 1000
        uniformes.uTempo.value = t
        uniformes.uVento.value.lerp(ventoAlvo, 0.03)

        for (const [c, inicio] of entrando) {
          // Entrada com ressalto (easeOutBack).
          const k = Math.min(1, (agora - inicio) / 700)
          const s = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2)
          c.grupo.scale.setScalar(Math.max(0.001, s) * escalaTela)
          if (k >= 1) entrando.delete(c)
        }

        for (const c of corpos) {
          if (!c.agarrado) {
            tmp.copy(c.ancora)
            if (!semMovimento) tmp.y += Math.sin(t * 0.8 + c.fase) * 0.16
            // Mola amortecida: aceleração = k·(alvo − posição) − amortecimento·velocidade.
            const acel = tmp.sub(c.grupo.position).multiplyScalar(14).addScaledVector(c.vel, -3.2)
            c.vel.addScaledVector(acel, dt)
            c.grupo.position.addScaledVector(c.vel, dt)
          }
          if (!semMovimento || c.agarrado) {
            c.grupo.rotation.x += c.giro.x
            c.grupo.rotation.y += c.giro.y
            c.giro.lerp(c.giroBase, 0.012)
          }
        }
        // Empurram-se uns aos outros em vez de se atravessarem.
        for (let i = 0; i < corpos.length; i++)
          for (let j = i + 1; j < corpos.length; j++) {
            const a = corpos[i]!
            const b = corpos[j]!
            if (!a.grupo.visible || !b.grupo.visible) continue
            tmp.copy(b.grupo.position).sub(a.grupo.position)
            const d = tmp.length()
            const min = a.raio + b.raio
            if (d > 0 && d < min) {
              tmp.normalize().multiplyScalar((min - d) * 0.5)
              if (!a.agarrado) a.grupo.position.sub(tmp)
              if (!b.agarrado) b.grupo.position.add(tmp)
            }
          }

        renderer.render(cena, camara)
        quadros++
        if (agora - marco > 500) {
          medir.current?.(Math.round((quadros * 1000) / (agora - marco)))
          quadros = 0
          marco = agora
        }
        if (visivel && !document.hidden) pedir()
      }
      const pedir = () => {
        if (!quadro) quadro = requestAnimationFrame(passo)
      }
      const aoMudarAba = () => {
        anterior = performance.now()
        if (!document.hidden) pedir()
      }
      document.addEventListener('visibilitychange', aoMudarAba)
      pedir()

      parar = () => {
        cancelAnimationFrame(quadro)
        observador.disconnect()
        io.disconnect()
        document.removeEventListener('visibilitychange', aoMudarAba)
        window.removeEventListener('pointermove', aoMoverJanela)
        canvas.removeEventListener('pointerdown', aoBaixar)
        canvas.removeEventListener('pointermove', aoMover)
        canvas.removeEventListener('pointerup', aoSoltar)
        canvas.removeEventListener('pointercancel', aoSoltar)
        cena.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.geometry.dispose()
            const mats = Array.isArray(o.material) ? o.material : [o.material]
            for (const m of mats) {
              for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose()
              m.dispose()
            }
          }
        })
        geoPoeira.dispose()
        matPoeira.dispose()
        pmrem.dispose()
        renderer.dispose()
      }
    })()

    return () => {
      cancelado = true
      parar()
    }
  }, [])

  return <canvas ref={tela} className={className} aria-hidden="true" />
}
