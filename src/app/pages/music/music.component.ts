import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MusicService } from '../../service/music.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-music',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './music.component.html',
    styleUrls: ['./music.component.scss']
})
export class MusicComponent implements OnInit {

    form: FormGroup;

    // Data from backend
    myMusics: any[] = [];

    // State for menu
    openMenuIndex: number | null = null;
    copiedId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private musicService: MusicService,
        private router: Router
    ) {
        this.form = this.fb.group({
            musicName: ['', Validators.required],
            artistName: ['', Validators.required]
        });

        // Close menu on outside click
        window.addEventListener('click', (e: any) => {
            // If clicking inside menu or toggle, ignore
            if (e.target.closest('.dropdown-menu') || e.target.closest('.edit-icon')) return;
            this.openMenuIndex = null;
        });
    }

    ngOnInit(): void {
        this.loadMusics();
    }

    loadMusics() {
        this.musicService.getLibrary().subscribe({
            next: (response) => {
                // Determine structure. Assuming response is list of objects with { music: { name, artist }, personalTone, idUserMusic }
                // Sort by idUserMusic desc to show latest
                const sorted = response.sort((a: any, b: any) => b.idUserMusic - a.idUserMusic);

                // Take top 3
                const top3 = sorted.slice(0, 3);

                // Map to UI structure
                this.myMusics = top3.map((m: any) => ({
                    name: m.music.nameMusic,
                    artist: m.music.artist,
                    tone: m.personalTone,
                    // Keep original object if needed
                    ...m
                }));
            },
            error: (err) => {
                console.error('Error loading library', err);
            }
        });
    }

    toggleMenu(index: number, event: MouseEvent) {
        event.stopPropagation();
        if (this.openMenuIndex === index) {
            this.openMenuIndex = null;
        } else {
            this.openMenuIndex = index;
        }
    }

    openMusic(music: any) {
        this.router.navigate(['/music/cipher', music.idUserMusic], { queryParams: { from: 'dashboard' } });
        this.openMenuIndex = null;
    }

    copyLink(music: any, index: number, event: MouseEvent) {
        event.stopPropagation();
        const url = `${window.location.origin}/music/cipher/${music.idUserMusic}?from=dashboard`;

        navigator.clipboard.writeText(url);
        this.copiedId = index;

        setTimeout(() => {
            this.copiedId = null;
        }, 2000);
    }

    deleteMusic(index: number, event: MouseEvent) {
        event.stopPropagation();
        // Visual delete only for now as requested
        this.myMusics.splice(index, 1);
        this.openMenuIndex = null;
    }

    addMusic() {
        if (this.form.invalid) return;

        const { musicName, artistName } = this.form.value;

        // Generate Slugs for Cifra Club
        const artistSlug = this.generateSlug(artistName);
        const musicSlug = this.generateSlug(musicName);

        // Ordem: https://www.cifraclub.com.br/artista/musica/
        const cifraClubUrl = `https://www.cifraclub.com.br/${artistSlug}/${musicSlug}/`;
        console.log(`URL Gerada: ${cifraClubUrl}`);

        this.musicService.addMusic(cifraClubUrl).subscribe({
            next: (response) => {
                const newMusic = {
                    name: response.music.nameMusic,
                    artist: response.music.artist,
                    tone: response.personalTone,
                    ...response
                };

                this.myMusics.unshift(newMusic);

                // Keep only top 3
                if (this.myMusics.length > 3) {
                    this.myMusics.pop();
                }

                this.form.reset();
            },
            error: (err) => {
                console.error('Error adding music', err);
            }
        });
    }

    toTitleCase(str: string): string {
        const exceptions = ['e', 'do', 'da', 'dos', 'das', 'de', 'di', 'du', '&', 'em', 'na', 'no', 'nas', 'nos', 'a', 'o', 'as', 'os'];

        return str.toLowerCase().split(' ').map((word, index) => {
            // Se for a primeira palavra ou não estiver na lista de exceções, capitaliza
            if (index === 0 || !exceptions.includes(word)) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            // Caso contrário, retorna minúsculo
            return word;
        }).join(' ');
    }

    generateSlug(text: string): string {
        return text.trim().toLowerCase().replace(/\s+/g, '-');
    }

    goToLibrary() {
        this.router.navigate(['/library']);
    }
}
