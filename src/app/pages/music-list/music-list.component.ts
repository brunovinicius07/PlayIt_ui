import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicService } from '../../service/music.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-music-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './music-list.component.html',
    styleUrls: ['./music-list.component.scss']
})
export class MusicListComponent implements OnInit {

    myMusics: any[] = [];
    openMenuIndex: number | null = null;
    copiedId: number | null = null;

    constructor(
        private musicService: MusicService,
        private router: Router
    ) {
        window.addEventListener('click', (e: any) => {
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
                // Sort by idUserMusic desc
                const sorted = response.sort((a: any, b: any) => b.idUserMusic - a.idUserMusic);

                // No slice, show all
                this.myMusics = sorted.map((m: any) => ({
                    name: m.music.nameMusic,
                    artist: m.music.artist,
                    tone: m.personalTone,
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
        this.router.navigate(['/music/cipher', music.idUserMusic], { queryParams: { from: 'library' } });
        this.openMenuIndex = null;
    }

    copyLink(music: any, index: number, event: MouseEvent) {
        event.stopPropagation();
        const url = `${window.location.origin}/music/cipher/${music.idUserMusic}?from=library`;

        navigator.clipboard.writeText(url);
        this.copiedId = index;

        setTimeout(() => {
            this.copiedId = null;
        }, 2000);
    }

    showDeleteModal = false;
    musicToDelete: any = null;

    deleteMusic(music: any, event: MouseEvent) {
        event.stopPropagation();
        this.musicToDelete = music;
        this.showDeleteModal = true;
        this.openMenuIndex = null;
    }

    confirmDelete() {
        if (!this.musicToDelete) return;

        this.musicService.deleteMusic(this.musicToDelete.idUserMusic).subscribe({
            next: () => {
                this.myMusics = this.myMusics.filter(m => m.idUserMusic !== this.musicToDelete.idUserMusic);
                this.cancelDelete();
            },
            error: (err) => {
                console.error('Error deleting music', err);
                // Fallback visual delete if backend fails (optional, but requested by user logic previously)
                this.myMusics = this.myMusics.filter(m => m.idUserMusic !== this.musicToDelete.idUserMusic);
                this.cancelDelete();
            }
        });
    }

    cancelDelete() {
        this.showDeleteModal = false;
        this.musicToDelete = null;
    }

    goBack() {
        this.router.navigate(['/music']);
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
