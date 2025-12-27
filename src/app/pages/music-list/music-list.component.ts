import { Component, OnInit } from '@angular/core';
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
