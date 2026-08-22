import { SceneData } from '../types';
import stillScene1 from '../assets/images/scene1_shop_decision_1787378949998.jpg';
import stillScene2 from '../assets/images/scene2_closing_turn_1787378961222.jpg';
import stillScene3 from '../assets/images/scene3_rice_terrace_1787378973564.jpg';
import stillScene4 from '../assets/images/scene4_family_legacy_1787378987826.jpg';

export const SCENES: SceneData[] = [
  {
    id: 1,
    title: "Establishing the Shop",
    titleIndo: "Adegan 1: Keheningan di Balik Etalase",
    subtitleIndo: "Toko Kelontong Sunyi, Fajar Dingin",
    duration: 3.5,
    timeStart: 0,
    timeEnd: 3.5,
    shotType: "Medium Shot (Eye-Level to Slow Push-in)",
    lightingSetup: "Low-Key Tungsten & Dinginnya Sinar Fajar Luar (3200K vs 5600K)",
    lensType: "50mm Anamorphic Prime (T1.5, Shallow Depth of Field)",
    cameraMovement: "Slow Creeping Dolly-In (Menekan rasa keterasingan dan kesepian batin)",
    colorTemperature: "Dingin, Desaturasi Biru-Abu dengan aksen bohlam redup",
    aspectRatio: "2.39:1 Anamorphic Scope",
    onScreenText: "THE DECISION",
    subText: "SEBUAH KEPUTUSAN",
    imageStill: stillScene1,
    cameraSpecs: {
      sensor: "ARRI Alexa Mini LF Large Format",
      focalLength: "50mm Master Anamorphic",
      aperture: "T1.5",
      iso: "800 EI",
      shutterAngle: "180.0°",
      kelvin: "3200K / 5600K Mix"
    },
    
    narrationIndo: "Hari-hari yang panjang berulang tanpa henti... Di antara deretan barang dan angka-angka yang sunyi, ada ruang hampa yang tak pernah terisi.",
    narrationIndoPoetic: "Di balik dinding-dinding sempit ini, waktu menguap perlahan. Setiap coretan angka di buku usang tak lagi mampu membeli makna kehadiran.",
    narrationEnglish: "The long days... but something was missing.",
    sfxDescription: "Dengungan monoton kompresor kulkas tua, detak jam dinding lambat, sayup deru kendaraan subuh.",
    musicMood: "Nada piano tunggal minor yang menggantung, melankolis, diiringi synthesizer drone sunyi.",
    sfxCues: [
      { timeOffset: 0.2, name: "Refrigerator Hum & Room Tone", soundType: "drone" },
      { timeOffset: 1.5, name: "Paper Page Rustle", soundType: "foley" }
    ],

    directorVision: "Tampilkan tokoh utama sebagai sosok ayah pekerja keras yang terjebak dalam rutinitas mekanis perkotaan. Tatapannya pada buku kas bukan sekadar menghitung uang, melainkan menimbang arah hidup dan arti keberadaannya bagi keluarga.",
    actingNotes: "Bahu sedikit membungkuk lelah, helaan nafas tertahan, mata menatap jauh melampaui kertas buku kas.",
    symbolism: "Buku kas mewakili jerat materi; jendela fajar berkabut mewakili kerinduan akan tanah dan kebebasan sejati.",
    colorPalette: ["#1e293b", "#334155", "#64748b", "#d97706", "#0f172a"]
  },
  {
    id: 2,
    title: "Closing Up & The Turn",
    titleIndo: "Adegan 2: Titik Balik & Menutup Masa Lalu",
    subtitleIndo: "Gembok Terkunci, Langkah Menuju Terminal",
    duration: 4.0,
    timeStart: 3.5,
    timeEnd: 7.5,
    shotType: "Medium Profile Shot cut to Low-Angle Tracking Shot",
    lightingSetup: "Siluet Kontras Tinggi, Sinar Pagi Memecah Kegelapan",
    lensType: "35mm Wide Anamorphic (Menangkap transisi ruang sempit ke dunia luas)",
    cameraMovement: "Pan Down mengikuti roller shutter, lalu Dolly Tracking dari belakang langkah kaki sang ayah.",
    colorTemperature: "Peralihan dari Dingin Slate ke Hangat Emas Pertama",
    aspectRatio: "2.39:1 Anamorphic Scope",
    onScreenText: "A NEW BEGINNING",
    subText: "AWAL YANG BARU",
    imageStill: stillScene2,
    cameraSpecs: {
      sensor: "RED V-Raptor 8K VV",
      focalLength: "35mm Atlas Orion Anamorphic",
      aperture: "T2.0",
      iso: "640 EI",
      shutterAngle: "180.0°",
      kelvin: "4500K Transition"
    },

    narrationIndo: "Demi mereka... darah dagingku, lentera hidupku. Aku harus berani melangkah keluar dari sangkar ini.",
    narrationIndoPoetic: "Kututup lembaran kelabu ini. Demi tatap mata anak-anakku, aku rela meruntuhkan rasa takut dan melangkah menuju tanah harapan.",
    narrationEnglish: "For *them*... I had to change.",
    sfxDescription: "Derak keras tirai besi diturunkan (rolling shutter), denting gembok terkunci, hembusan nafas mantap, deru mesin bus antar-kota.",
    musicMood: "Gesekan cello mulai masuk dengan crescendo lembut, membangun tekad dan keberanian emosional.",
    sfxCues: [
      { timeOffset: 0.5, name: "Metal Roller Shutter Slam", soundType: "impact" },
      { timeOffset: 1.8, name: "Heavy Exhale / Breath of Resolve", soundType: "foley" },
      { timeOffset: 2.8, name: "Gravel Footsteps & Distant Bus Horn", soundType: "ambience" }
    ],

    directorVision: "Gerakan menurunkan rolling shutter adalah metafora katarsis penutupan masa lalu. Saat ia menggenggam foto keluarga kecilnya di saku, tatapan matanya berubah dari ragu menjadi tekad baja seorang pejuang keluarga.",
    actingNotes: "Menarik nafas dalam-dalam saat gembok berbunyi 'klik'. Jari-jemari meremas lembut tepi foto usang di dada.",
    symbolism: "Satu kardus sederhana melambangkan penanggalan beban materialisme; foto keluarga adalah kompas moral.",
    colorPalette: ["#0f172a", "#475569", "#b45309", "#f59e0b", "#fef3c7"]
  },
  {
    id: 3,
    title: "Working the Fields",
    titleIndo: "Adegan 3: Tanah Leluhur & Peluh Kejujuran",
    subtitleIndo: "Sawah Terasering Hijau, Fajar Emas Menyingsing",
    duration: 4.5,
    timeStart: 7.5,
    timeEnd: 12.0,
    shotType: "Extreme Wide Establishing Shot cut to Medium Tracking in Mud",
    lightingSetup: "Golden Hour Fajar Alami, Rim-Light Emas Membingkai Keringat dan Caping",
    lensType: "85mm Telephoto (Kompresi latar pegunungan & terasering sawah berkilau)",
    cameraMovement: "Majestic Jib/Crane Up mengungkap bentang alam, dilanjutkan Slow Motion (48fps) ayunan cangkul.",
    colorTemperature: "Hangat Tropis Memukau (5200K - 5800K), Hijau Zamrud & Refleksi Emas Air Sawah",
    aspectRatio: "2.39:1 Anamorphic Scope",
    onScreenText: "HONEST LABOR. OUR ROOTS.",
    subText: "PELUH KEJUJURAN. AKAR KEHIDUPAN.",
    imageStill: stillScene3,
    cameraSpecs: {
      sensor: "ARRI Alexa Mini LF Large Format",
      focalLength: "85mm Cooke Anamorphic/i Full Frame Plus",
      aperture: "T2.3",
      iso: "800 EI",
      shutterAngle: "180.0° (48fps Slow-Mo)",
      kelvin: "5600K Golden Dawn"
    },

    narrationIndo: "Kerja keras, ya. Tapi di sini... di atas tanah ini, aku menanam masa depan mereka dengan tetesan peluh yang jujur.",
    narrationIndoPoetic: "Bumi tidak pernah berdusta. Setiap ayunan cangkul yang membelah lumpur adalah kidung doa yang kusemai bagi tunas-tunas jiwaku.",
    narrationEnglish: "Hard work, yes. But here... I build their future.",
    sfxDescription: "Kecipak lumpur subur nan kental, desau angin menerpa batang padi basah embun, kicauan burung prenjak & kutilang fajar.",
    musicMood: "Perpaduan suling Sunda/bambu berpadu string orkestra megah dan petikan gitar akustik hangat yang menggetarkan sanubari.",
    sfxCues: [
      { timeOffset: 0.3, name: "Mud Splash & Hoe Strike (Cangkul)", soundType: "foley" },
      { timeOffset: 1.2, name: "Morning Birds & Wind Whispers", soundType: "nature" },
      { timeOffset: 3.0, name: "Water Trickle through Terraces", soundType: "nature" }
    ],

    directorVision: "Tampilkan kemuliaan seorang petani tradisional. Keringat di dahi bukan penderitaan, melainkan mahkota kehormatan. Visual lanskap sawah bertingkat Indonesia harus bernafaskan keagungan spiritual.",
    actingNotes: "Otot lengan berkilat oleh keringat dan sinar mentari, ayunan cangkul teratur dan berirama, nafas teratur penuh konsentrasi.",
    symbolism: "Tanah dan lumpur adalah akar martabat; padi hijau adalah benih harapan yang tumbuh seiring waktu.",
    colorPalette: ["#14532d", "#16a34a", "#ca8a04", "#fbbf24", "#fef08a"]
  },
  {
    id: 4,
    title: "Family and Future",
    titleIndo: "Adegan 4: Pelukan Cahaya & Warisan Abadi",
    subtitleIndo: "Senja Keemasan, Tawa Anak di Atas Pundak",
    duration: 5.0,
    timeStart: 12.0,
    timeEnd: 17.0,
    shotType: "Close-Up Hero Shot to Panoramic Wide Sunset Horizon",
    lightingSetup: "Golden Hour Magis (2800K), Anamorphic Lens Flare Horizontal, Siluet Penuh Kehangatan",
    lensType: "35mm & 50mm Anamorphic Duo (Bokeh creamy dan flare emas khas film 35mm)",
    cameraMovement: "Circling Orbital Dolly mengitari sang ayah yang menggendong anak, lalu Tilt Up perlahan ke langit senja.",
    colorTemperature: "Emas Tua Menggelegar, Amber, Jingga Mentari Terbenam",
    aspectRatio: "2.39:1 Anamorphic Scope",
    onScreenText: "FOR THE FAMILY. FOR OUR LEGACY.",
    subText: "UNTUK KELUARGA. UNTUK WARISAN KITA.",
    imageStill: stillScene4,
    cameraSpecs: {
      sensor: "ARRI Alexa Mini LF Large Format",
      focalLength: "40mm Hawk V-Lite Anamorphic",
      aperture: "T1.8",
      iso: "800 EI",
      shutterAngle: "180.0°",
      kelvin: "2800K Golden Sunset"
    },

    narrationIndo: "Keluargaku... kalian adalah muara dari setiap lelahku. Fondasi hidupku. Di tanah ini kita berakar, dan warisan ini abadi selamanya.",
    narrationIndoPoetic: "Tawamu adalah upah terindah dari setiap butir peluhku. Kita tidak hanya mewarisi padi, kita mewariskan jiwa yang tak kenal menyerah.",
    narrationEnglish: "My family. Their foundation. Our path.",
    sfxDescription: "Gelak tawa murni anak-anak yang renyah, desau angin senja yang lembut menyisir butir padi matang, derik jangkrik senja yang syahdu.",
    musicMood: "Puncak emosional akbar: orkestrasi orkestra penuh berpadu vokal paduan suara lembut dan denting piano terakhir yang hangat membekas.",
    sfxCues: [
      { timeOffset: 0.5, name: "Children Giggling & Running", soundType: "dialogue" },
      { timeOffset: 2.0, name: "Warm Evening Breeze & Grain Rustle", soundType: "nature" },
      { timeOffset: 4.0, name: "Final Piano Chime & Sustained Chord", soundType: "music" }
    ],

    directorVision: "Klimaks emosional film dokumenter. Senyuman lebar sang ayah dengan anak di pundaknya membuktikan bahwa keputusan kembali ke tanah adalah pilihan terbaik dalam hidupnya. Penonton harus merasakan kehangatan cinta tanpa batas seorang ayah.",
    actingNotes: "Tawa tulus merekah, mata berbinar menatap anak yang tertawa di pundak, tangan sang istri merangkul pundak dengan penuh rasa syukur.",
    symbolism: "Anak di atas pundak adalah generasi penerus yang berdiri di atas pengorbanan orang tuanya; mentari terbenam adalah penutup sempurna sebuah perjuangan.",
    colorPalette: ["#78350f", "#b45309", "#d97706", "#f59e0b", "#fde68a"]
  }
];

export const DIRECTOR_TREATMENT = {
  projectTitle: "The Rice Farmer's Decision",
  projectTitleIndo: "Keputusan Sang Petani: Jejak Cinta & Tanah Warisan",
  format: "Dokumenter Sinematik Puitis / 15-17 Detik Spot",
  directorLogline: "Seorang ayah memutuskan meninggalkan kebisingan toko kelontong perkotaan demi kembali mencangkul tanah leluhur, menemukan kembali kebahagiaan sejati dan masa depan anak-anaknya di pelukan sawah nan asri.",
  thematicCore: "Pengorbanan seorang ayah, kemuliaan keringat yang jujur, dan ikatan abadi antara keluarga dan tanah air.",
  visualStyleGuide: {
    colorProgression: "Dimulai dari palet dingin, desaturasi, dan klaustrofobik di toko (Scene 1-2) bertransisi secara dramatis ke palet hijau zamrud yang mekar dan ledakan emas senja (Golden Hour) yang membuncah (Scene 3-4).",
    aspectRatio: "2.39:1 Cinemascope anamorphic dengan letterbox cinema bar hitam pekat untuk menciptakan bobot emosi teatrikal.",
    cameraLanguage: "Kamera bergerak lambat dan metodis. Tidak ada potongan kasar yang terburu-buru. Setiap frame diberi ruang untuk bernafas agar emosi narasi meresap ke kalbu penonton.",
    lightingPhilosophy: "Cahaya praktis alami. Memanfaatkan sinar fajar dan 'golden hour' Indonesia yang khas dengan flare horizontal anamorphic."
  },
  soundDesignPhilosophy: "Desain suara dirancang berlapis (stems): dimulai dari kesepian mekanis kulkas toko yang menyesakkan dada, diredam oleh suara gembok yang tegas, lalu dibuka secara megah oleh simfoni alam sawah, suling bambu, dan ditutup dengan tawa jernih anak-anak."
};
