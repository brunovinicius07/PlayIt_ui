import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-music',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './music.component.html',
    styleUrls: ['./music.component.scss']
})
export class MusicComponent {

    form: FormGroup;

    // Mock initial data
    myMusics = [
        { name: 'Sigilo', artist: 'Roberta Reis', tone: 'F#' },
        { name: 'Morena', artist: 'Luan Santana', tone: 'F#' },
        { name: 'Cobaia', artist: 'Lauana Prado', tone: 'F#' }
    ];

    // State for menu
    openMenuIndex: number | null = null;
    copiedId: number | null = null;

    constructor(private fb: FormBuilder) {
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

    toggleMenu(index: number, event: MouseEvent) {
        event.stopPropagation();
        if (this.openMenuIndex === index) {
            this.openMenuIndex = null;
        } else {
            this.openMenuIndex = index;
        }
    }

    openMusic(music: any) {
        // Formato Cifra Club: /artista/musica/
        const artistSlug = this.generateSlug(music.artist);
        const musicSlug = this.generateSlug(music.name);
        // Garante ordem: Artista -> Música
        const url = `https://www.cifraclub.com.br/${artistSlug}/${musicSlug}/`;
        window.open(url, '_blank');
        this.openMenuIndex = null;
    }

    copyLink(music: any, index: number, event: MouseEvent) {
        event.stopPropagation();
        const artistSlug = this.generateSlug(music.artist);
        const musicSlug = this.generateSlug(music.name);
        const url = `https://www.cifraclub.com.br/${artistSlug}/${musicSlug}/`;

        navigator.clipboard.writeText(url);
        this.copiedId = index;

        setTimeout(() => {
            this.copiedId = null;
        }, 2000);
    }

    deleteMusic(index: number, event: MouseEvent) {
        event.stopPropagation();
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

        // Simulate Add (with formatted text)
        this.myMusics.unshift({
            name: this.toTitleCase(musicName),
            artist: this.toTitleCase(artistName),
            tone: 'F#' // Mockado
        });

        // Keep only top 3
        if (this.myMusics.length > 3) {
            this.myMusics.pop();
        }

        this.form.reset();
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
        return text
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .trim();
    }
}
