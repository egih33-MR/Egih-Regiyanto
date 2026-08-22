import JSZip from 'jszip';
import { SCENES, DIRECTOR_TREATMENT } from '../data/scenes';

export async function downloadCompleteProductionZip(onProgress?: (progress: number, status: string) => void) {
  const zip = new JSZip();

  onProgress?.(10, 'Menyiapkan struktur direktori arsip...');

  // 1. Root Readme
  const readmeContent = `# THE RICE FARMER'S DECISION
## Paket Lengkap Produksi Video Dokumenter Sinematik (Director's Production Package)

Sutradara: Egih
Durasi: 17.0 Detik (4 Babak Sinematik)
Format Visual: 2.39:1 Anamorphic Cinemascope & 16:9 4K Master
Audio: Multi-Stem Soundscape & Voiceover Bahasa Indonesia

---

### ISI PAKET PRODUKSI:
1. **Master_Stills/**: 4 Foto adegan visualisasi fotorealistis (35mm Anamorphic Render).
2. **Naskah_dan_Sulih_Suara/**:
   - \`naskah_narasi_bahasa_indonesia.txt\` (Versi Emosional & Puitis)
   - \`storyboard_treatment_en.txt\` (Versi Original Storyboard)
3. **Subtitles/**:
   - \`the_rice_farmers_decision.srt\` (File subtitle siap pakai untuk NLE seperti Premiere Pro / DaVinci Resolve / CapCut / Final Cut Pro)
4. **Dokumen_Sutradara/**:
   - \`director_treatment_dan_sinematografi.md\` (Breakdown lensa, sensor kamera, tata cahaya, & kurva emosi)
   - \`shotlist_metadata.json\` (Data teknis per adegan terstruktur)

---
Dibuat dengan Google AI Studio Build.
`;
  zip.file('README_PRODUKSI.md', readmeContent);

  // 2. Folder Naskah_dan_Sulih_Suara
  const scriptsFolder = zip.folder('Naskah_dan_Sulih_Suara');
  if (scriptsFolder) {
    let scriptTxt = `==========================================================\n`;
    scriptTxt += `NASKAH LENGKAP & SULIH SUARA - THE RICE FARMER'S DECISION\n`;
    scriptTxt += `==========================================================\n\n`;

    SCENES.forEach((s) => {
      scriptTxt += `[ADEGAN 0${s.id}: ${s.titleIndo.toUpperCase()}] (${s.duration}s)\n`;
      scriptTxt += `Teks di Layar: ${s.onScreenText} (${s.subText || ''})\n`;
      scriptTxt += `Tipe Bidikan : ${s.shotType} | ${s.lensType}\n`;
      scriptTxt += `Tata Cahaya  : ${s.lightingSetup}\n`;
      scriptTxt += `Narasi Emotif: "${s.narrationIndo}"\n`;
      scriptTxt += `Narasi Puitis: "${s.narrationIndoPoetic}"\n`;
      scriptTxt += `Suasana SFX  : ${s.sfxDescription}\n`;
      scriptTxt += `----------------------------------------------------------\n\n`;
    });

    scriptsFolder.file('naskah_narasi_bahasa_indonesia.txt', scriptTxt);

    let enStoryboard = `ORIGINAL 4-PANEL STORYBOARD SPECIFICATION\n\n`;
    SCENES.forEach((s) => {
      enStoryboard += `Panel ${s.id}: ${s.title} (${s.duration}s)\n`;
      enStoryboard += `Text: "${s.onScreenText}"\n`;
      enStoryboard += `Shot: ${s.shotType}\n`;
      enStoryboard += `Director Vision: ${s.directorVision}\n\n`;
    });
    scriptsFolder.file('storyboard_original_en.txt', enStoryboard);
  }

  // 3. Subtitles SRT
  const subFolder = zip.folder('Subtitles');
  if (subFolder) {
    let srt = '';
    SCENES.forEach((s, idx) => {
      const formatTime = (sec: number) => {
        const h = Math.floor(sec / 3600).toString().padStart(2, '0');
        const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
        const sSec = Math.floor(sec % 60).toString().padStart(2, '0');
        const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
        return `${h}:${m}:${sSec},${ms}`;
      };

      srt += `${idx + 1}\n`;
      srt += `${formatTime(s.timeStart)} --> ${formatTime(s.timeEnd)}\n`;
      srt += `${s.onScreenText}\n`;
      srt += `${s.narrationIndo}\n\n`;
    });
    subFolder.file('the_rice_farmers_decision.srt', srt);
  }

  // 4. Dokumen Sutradara & Treatment
  const docFolder = zip.folder('Dokumen_Sutradara');
  if (docFolder) {
    let docMd = `# TREATMENT SUTRADARA LENGKAP & SPESIFIKASI SINEMATOGRAFI\n\n`;
    docMd += `## Judul Proyek\n${DIRECTOR_TREATMENT.projectTitle} (${DIRECTOR_TREATMENT.projectTitleIndo})\n\n`;
    docMd += `## Logline Sutradara\n${DIRECTOR_TREATMENT.directorLogline}\n\n`;
    docMd += `## Inti Tematik\n${DIRECTOR_TREATMENT.thematicCore}\n\n`;
    docMd += `## Panduan Gaya Visual\n`;
    docMd += `- Progresi Warna: ${DIRECTOR_TREATMENT.visualStyleGuide.colorProgression}\n`;
    docMd += `- Rasio Aspek: ${DIRECTOR_TREATMENT.visualStyleGuide.aspectRatio}\n`;
    docMd += `- Bahasa Kamera: ${DIRECTOR_TREATMENT.visualStyleGuide.cameraLanguage}\n`;
    docMd += `- Filosofi Tata Cahaya: ${DIRECTOR_TREATMENT.visualStyleGuide.lightingPhilosophy}\n\n`;
    docMd += `## Desain Tata Suara\n${DIRECTOR_TREATMENT.soundDesignPhilosophy}\n\n`;
    docMd += `## Shot List & Camera Rigging\n`;

    SCENES.forEach(s => {
      docMd += `### Adegan 0${s.id}: ${s.titleIndo}\n`;
      docMd += `- **Kamera & Sensor**: ${s.cameraSpecs?.sensor || 'ARRI Alexa Mini LF'}\n`;
      docMd += `- **Lensa**: ${s.cameraSpecs?.focalLength || s.lensType} (${s.cameraSpecs?.aperture || 'T1.5'})\n`;
      docMd += `- **ISO & Shutter**: ${s.cameraSpecs?.iso || '800 EI'} | ${s.cameraSpecs?.shutterAngle || '180°'}\n`;
      docMd += `- **Suhu Kelvin**: ${s.cameraSpecs?.kelvin || '4500K'}\n`;
      docMd += `- **Gerakan Kamera**: ${s.cameraMovement}\n`;
      docMd += `- **Tata Cahaya**: ${s.lightingSetup}\n`;
      docMd += `- **Palet Warna**: ${s.colorPalette.join(', ')}\n\n`;
    });

    docFolder.file('director_treatment_dan_sinematografi.md', docMd);
    docFolder.file('shotlist_metadata.json', JSON.stringify(SCENES, null, 2));
  }

  // 5. Master Stills (Fetch image blobs and write to zip)
  const stillsFolder = zip.folder('Master_Stills');
  if (stillsFolder) {
    for (let i = 0; i < SCENES.length; i++) {
      const scene = SCENES[i];
      onProgress?.(25 + i * 15, `Mengunduh & mengemas Master Still Adegan 0${scene.id}...`);

      try {
        const response = await fetch(scene.imageStill);
        const blob = await response.blob();
        stillsFolder.file(
          `Still_Scene_0${scene.id}_${scene.title.replace(/\s+/g, '_')}.jpg`, 
          blob
        );
      } catch (err) {
        console.warn(`Gagal memuat gambar adegan ${scene.id}`, err);
      }
    }
  }

  onProgress?.(85, 'Melakukan kompresi ZIP berkas produksi...');

  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress?.(85 + Math.floor(metadata.percent * 0.14), `Kompresi: ${Math.floor(metadata.percent)}%`);
  });

  onProgress?.(100, 'Selesai! Memulai pengunduhan...');

  // Trigger download link
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Paket_Produksi_The_Rice_Farmers_Decision_HD.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
