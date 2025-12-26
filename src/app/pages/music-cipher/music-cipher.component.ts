import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicService } from '../../service/music.service';

@Component({
    selector: 'app-music-cipher',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './music-cipher.component.html',
    styleUrls: ['./music-cipher.component.scss']
})
export class MusicCipherComponent implements OnInit {

    music: any = null;
    idUserMusic: number | null = null;

    // Tones list
    tones: string[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    showToneSelector = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private musicService: MusicService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.idUserMusic = Number(id);
            this.loadMusic(this.idUserMusic);
        }
    }

    loadMusic(id: number) {
        this.musicService.getMusicDetail(id).subscribe({
            next: (res) => {
                this.music = {
                    name: res.music.nameMusic,
                    artist: res.music.artist,
                    tone: res.personalTone,
                    cipher: res.music.cipherContent,
                    ...res
                };

                // Fetch Global Music to get Original Tone
                if (res.music && res.music.id) {
                    this.musicService.getMusic(res.music.id).subscribe({
                        next: (globalRes) => {
                            console.log('Global Music Loaded:', globalRes);
                            // Assume user said "ver a musica global que mostra o tom original"
                            this.music.originalTone = globalRes.tone || globalRes.tom || globalRes.key;
                        },
                        error: (err) => console.error('Error loading global music', err)
                    });
                }
            },
            error: (err) => console.error('Error loading music detail', err)
        });
    }

    restoreOriginal() {
        if (this.music && this.music.originalTone) {
            console.log('Restoring to original tone:', this.music.originalTone);
            this.changeTone(this.music.originalTone);
        } else {
            console.warn('Original tone not available');
            // Optional: alert('Tom original não encontrado');
        }
    }

    toggleToneSelector() {
        this.showToneSelector = !this.showToneSelector;
    }

    changeTone(newTone: string) {
        if (!this.idUserMusic) return;

        this.showToneSelector = false;

        // Optimistic update (or wait for backend?)
        // Backend returns the transposed cipher, so we must wait or show loading.
        // I'll wait for backend.

        this.musicService.updateTone(this.idUserMusic, newTone).subscribe({
            next: (res) => {
                this.music = {
                    name: res.music.nameMusic,
                    artist: res.music.artist,
                    tone: res.personalTone,
                    cipher: res.music.cipherContent,
                    ...res
                };
            },
            error: (err) => console.error('Error changing tone', err)
        });
    }

    goBack() {
        const params = this.route.snapshot.queryParamMap;
        const from = params.get('from');

        if (from === 'block') {
            const blockId = params.get('blockId');
            const repertoireId = params.get('repertoireId');
            if (blockId && repertoireId) {
                this.router.navigate(['/repertoire', repertoireId, 'blockmusic', blockId]);
                return;
            }
        }

        if (from === 'dashboard') {
            this.router.navigate(['/music']);
        } else {
            // Default fallback
            this.router.navigate(['/library']);
        }
    }
}
