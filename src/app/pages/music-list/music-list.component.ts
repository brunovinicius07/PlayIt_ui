import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MusicService } from '../../service/music.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-music-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './music-list.component.html',
    styleUrls: ['./music-list.component.scss']
})
export class MusicListComponent implements OnInit {

    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    myMusics: any[] = [];
    openMenuIndex: number | null = null;
    copiedId: number | null = null;

    // Search & Pagination
    searchTerm: string = '';
    currentPage: number = 1;
    itemsPerPage: number = 10;

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

                // No slice, show all BUT mapped
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

    // --- Search & Pagination Logic ---

    get filteredMusics() {
        if (!this.searchTerm) {
            return this.myMusics;
        }
        const lowerTerm = this.searchTerm.toLowerCase();
        return this.myMusics.filter(music =>
            music.name.toLowerCase().includes(lowerTerm) ||
            music.artist.toLowerCase().includes(lowerTerm)
        );
    }

    get paginatedMusics() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredMusics.slice(startIndex, startIndex + this.itemsPerPage);
    }

    get totalPages() {
        return Math.ceil(this.filteredMusics.length / this.itemsPerPage);
    }

    updateSearch() {
        this.currentPage = 1; // Reset to first page on search
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.scrollToTop();
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.scrollToTop();
        }
    }

    scrollToTop() {
        const container = document.querySelector('.scroll-container');
        if (container) {
            container.scrollTop = 0;
        }
    }

    // --- End Search & Pagination ---

    toggleMenu(index: number, event: MouseEvent) {
        event.stopPropagation();

        const card = (event.currentTarget as HTMLElement).closest('.music-card') as HTMLElement;
        const container = this.scrollContainer?.nativeElement as HTMLElement;

        const isOpening = this.openMenuIndex !== index;
        this.openMenuIndex = isOpening ? index : null;

        if (!isOpening || !card || !container) return;

        setTimeout(() => {
            const menu = card.querySelector('.dropdown-menu') as HTMLElement;
            if (!menu) return;

            const containerRect = container.getBoundingClientRect();
            const menuRect = menu.getBoundingClientRect();
            const padding = 25;

            // 1. Ajusta se escondido embaixo
            if (menuRect.bottom > containerRect.bottom) {
                const diff = menuRect.bottom - containerRect.bottom + padding;
                container.scrollBy({ top: diff, behavior: 'smooth' });
            }

            // 2. Ajusta se escondido em cima
            if (menuRect.top < containerRect.top) {
                const diff = containerRect.top - menuRect.top + padding;
                container.scrollBy({ top: -diff, behavior: 'smooth' });
            }

            // 3. Ajuste para mostrar card inteiro
            const cardRect = card.getBoundingClientRect();

            if (cardRect.bottom > containerRect.bottom) {
                container.scrollBy({
                    top: cardRect.bottom - containerRect.bottom + padding,
                    behavior: 'smooth'
                });
            }

            if (cardRect.top < containerRect.top) {
                container.scrollBy({
                    top: -(containerRect.top - cardRect.top + padding),
                    behavior: 'smooth'
                });
            }

        }, 50);
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

                // Adjust pagination if page becomes empty
                if (this.paginatedMusics.length === 0 && this.currentPage > 1) {
                    this.currentPage--;
                }

                this.cancelDelete();
            },
            error: (err) => {
                console.error('Error deleting music', err);
                // Fallback visual delete
                this.myMusics = this.myMusics.filter(m => m.idUserMusic !== this.musicToDelete.idUserMusic);
                if (this.paginatedMusics.length === 0 && this.currentPage > 1) {
                    this.currentPage--;
                }
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
