import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicService } from '../../service/music.service';
import { BlockMusicService } from '../../service/blockmusic.service';

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
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    // Navigation
    playlist: any[] = [];
    currentIndex: number = -1;
    hasPrevious = false;
    hasNext = false;

    // Tones list
    tones: string[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    showToneSelector = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private musicService: MusicService,
        private blockService: BlockMusicService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.idUserMusic = Number(id);
                this.loadMusic(this.idUserMusic);
                this.checkNavigationContext();
            }
        });
    }

    checkNavigationContext() {
        const params = this.route.snapshot.queryParamMap;
        const from = params.get('from');
        const blockId = params.get('blockId');

        if (from === 'block' && blockId) {
            this.blockService.getOne(Number(blockId)).subscribe({
                next: (block: any) => {
                    // Normalize list (Same logic as BlockDetail)
                    const rawMusics = block.musics || block.items || [];

                    this.playlist = rawMusics.map((m: any) => {
                        const userDetails = m.userMusic || m;
                        const musicDetails = m.music || (m.userMusic ? m.userMusic.music : null) || m;

                        // Robust ID finding matching BlockDetail
                        const id = userDetails.idUserMusic || musicDetails.idUserMusic || m.idUserMusic;
                        return Number(id);
                    });



                    this.updateNavigationState();
                },
                error: (err) => console.error('Error loading block for navigation', err)
            });
        }
    }

    updateNavigationState() {
        if (!this.playlist.length || !this.idUserMusic) return;

        this.currentIndex = this.playlist.indexOf(this.idUserMusic);
        this.hasPrevious = this.currentIndex > 0;
        this.hasNext = this.currentIndex !== -1 && this.currentIndex < this.playlist.length - 1;
    }

    goToPrevious() {
        if (!this.hasPrevious) return;
        const prevId = this.playlist[this.currentIndex - 1];
        this.router.navigate(['/music/cipher', prevId], {
            queryParamsHandling: 'merge' // Keeps blockId, from, etc.
        });
    }

    goToNext() {
        if (!this.hasNext) return;
        const nextId = this.playlist[this.currentIndex + 1];
        this.router.navigate(['/music/cipher', nextId], {
            queryParamsHandling: 'merge'
        });
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

                // Reset scroll to top
                setTimeout(() => {
                    this.scrollToTop();
                }, 100);

                // Fetch Global Music to get Original Tone
                if (res.music && res.music.id) {
                    this.musicService.getMusic(res.music.id).subscribe({
                        next: (globalRes) => {

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



    scrollToTop() {
        if (this.scrollContainer && this.scrollContainer.nativeElement) {
            this.scrollContainer.nativeElement.scrollTop = 0;
        }
    }

    restoreOriginal() {
        if (this.music && this.music.originalTone) {

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
