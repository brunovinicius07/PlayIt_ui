import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockMusicService } from '../../service/blockmusic.service';
import { MusicService } from '../../service/music.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-block-detail',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DragDropModule],
    templateUrl: './block-detail.component.html',
    styleUrls: ['./block-detail.component.scss']
})
export class BlockDetailComponent implements OnInit {

    // ... (existing properties)

    // DRAG AND DROP
    drop(event: CdkDragDrop<any[]>) {
        moveItemInArray(this.musics, event.previousIndex, event.currentIndex);

        const orderedIds = this.musics.map(m => m.idUserMusic);
        this.blockService.reorderBlockItems(this.idBlock, orderedIds).subscribe({
            next: () => console.log('Músicas reordenadas no bloco'),
            error: (err) => console.error('Erro ao reordenar músicas', err)
        });
    }

    trackById(index: number, item: any): number {
        return item.idUserMusic;
    }


    idRepertoire!: number;
    idBlock!: number;
    blockName: string = '';
    repertoireName: string = '';

    musics: any[] = [];
    library: any[] = [];
    filteredLibrary: any[] = [];

    openMenuIndex: number | null = null;

    // Modals
    showAddModal = false;
    showRemoveModal = false;
    musicToRemove: any = null;

    searchControl = new FormControl('');

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private blockService: BlockMusicService,
        private musicService: MusicService
    ) {
        // Close menu on outside click
        window.addEventListener('click', (e: any) => {
            if (e.target.closest('.dropdown-menu') || e.target.closest('.edit-icon')) return;
            this.openMenuIndex = null;
        });
    }

    ngOnInit(): void {
        this.idRepertoire = Number(this.route.snapshot.paramMap.get('id'));
        this.idBlock = Number(this.route.snapshot.paramMap.get('idBlock'));

        this.loadBlockData();

        this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(val => {
            this.filterLibrary(val || '');
        });
    }

    loadBlockData() {
        this.blockService.getOne(this.idBlock).subscribe({
            next: (block: any) => {
                this.blockName = block.nameBlockMusic;
                this.idRepertoire = block.idRepertoire;

                // Backend might return 'musics' (new DTO) or 'items' (old DTO)
                const rawMusics = block.musics || block.items || [];
                this.musics = rawMusics.map((m: any) => {
                    // Robust Mapping Strategy

                    // 1. Identify where the 'music' details are (Name, Artist)
                    // Priority: m.music (Screenshot) > m.userMusic.music (Legacy) > m (Flat)
                    const musicDetails = m.music || (m.userMusic ? m.userMusic.music : null) || m;

                    // 2. Identify where the 'user' specific details are (Tone, ID)
                    // Priority: m (Screenshot - root has personalTone) > m.userMusic (Legacy)
                    const userDetails = m.userMusic || m;

                    return {
                        name: musicDetails.nameMusic || musicDetails.musicName || '',
                        artist: musicDetails.artist || musicDetails.artistName || musicDetails.singer || '',
                        tone: userDetails.personalTone || userDetails.tom || userDetails.tone || '',
                        idUserMusic: userDetails.idUserMusic || musicDetails.idUserMusic,
                        ...m
                    };
                });
            },
            error: () => console.error('Erro ao carregar bloco')
        });

        this.blockService.getRepertoireById(this.idRepertoire).subscribe({
            next: (rep: any) => this.repertoireName = rep.nameRepertoire
        });
    }

    goBack() {
        this.router.navigate(['/repertoire', this.idRepertoire, 'blockmusic']);
    }

    copiedId: number | null = null;

    // ...

    // MENUS
    toggleMenu(index: number, event: MouseEvent) {
        event.stopPropagation();

        const card = (event.currentTarget as HTMLElement).closest('.music-card') as HTMLElement;
        const isOpening = this.openMenuIndex !== index;
        this.openMenuIndex = isOpening ? index : null;

        if (!isOpening || !card) return;

        setTimeout(() => {
            const menu = card.querySelector('.dropdown-menu') as HTMLElement;
            if (!menu) return;

            const menuRect = menu.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportTop = 0;
            const padding = 25;

            // 1. Ajusta se escondido embaixo (Global)
            if (menuRect.bottom > viewportHeight) {
                const diff = menuRect.bottom - viewportHeight + padding;
                window.scrollBy({ top: diff, behavior: 'smooth' });
            }

            // 2. Ajusta se escondido em cima
            if (menuRect.top < viewportTop) {
                const diff = viewportTop - menuRect.top + padding;
                window.scrollBy({ top: -diff, behavior: 'smooth' });
            }

            // 3. Ajuste para mostrar card inteiro
            const cardRect = card.getBoundingClientRect();

            if (cardRect.bottom > viewportHeight) {
                window.scrollBy({
                    top: cardRect.bottom - viewportHeight + padding,
                    behavior: 'smooth'
                });
            }

            if (cardRect.top < viewportTop + 80) { // +80 por causa do header
                window.scrollBy({
                    top: -(viewportTop + 80 - cardRect.top + padding),
                    behavior: 'smooth'
                });
            }

        }, 50);
    }

    openMusic(music: any) {
        // Navigate to cipher with context
        this.router.navigate(['/music/cipher', music.idUserMusic], {
            queryParams: { from: 'block', blockId: this.idBlock, repertoireId: this.idRepertoire }
        });
    }

    copyLink(music: any, index: number, event: MouseEvent) {
        event.stopPropagation();
        const url = `${window.location.origin}/music/cipher/${music.idUserMusic}?from=block&blockId=${this.idBlock}&repertoireId=${this.idRepertoire}`;

        navigator.clipboard.writeText(url);
        this.copiedId = index;

        setTimeout(() => {
            this.copiedId = null;
        }, 2000);
    }

    // ADD MUSIC
    openAddModal() {
        this.showAddModal = true;
        this.loadLibrary();
    }

    closeAddModal() {
        this.showAddModal = false;
        this.searchControl.setValue('');
    }

    loadLibrary() {
        this.musicService.getLibrary().subscribe(response => {
            // 1. Map to UI structure FIRST
            const allMusics = response.map((m: any) => ({
                name: m.music.nameMusic,
                artist: m.music.artist,
                tone: m.personalTone,
                idUserMusic: m.idUserMusic,
                ...m
            }));

            // 2. Filter out items already in the block
            const existingIds = this.musics.map(m => m.idUserMusic);
            this.library = allMusics.filter(m => !existingIds.includes(m.idUserMusic));

            this.filterLibrary('');
        });
    }

    filterLibrary(term: string) {
        if (!term) {
            this.filteredLibrary = this.library;
            return;
        }
        const lower = term.toLowerCase();
        // Filter on the FLATTENED properties
        this.filteredLibrary = this.library.filter(m =>
            (m.name || '').toLowerCase().includes(lower) ||
            (m.artist || '').toLowerCase().includes(lower)
        );
    }

    addMusicToBlock(music: any) {
        this.blockService.addMusicToBlock(this.idBlock, music.idUserMusic).subscribe({
            next: (updatedBlock: any) => {
                // The backend returns a SINGLE updated block object (confirmed by screenshot)
                if (updatedBlock && updatedBlock.musics) {
                    this.musics = updatedBlock.musics.map((m: any) => {
                        // Robust Mapping Strategy (Same as loadBlockData)
                        const musicDetails = m.music || (m.userMusic ? m.userMusic.music : null) || m;
                        const userDetails = m.userMusic || m;

                        return {
                            name: musicDetails.nameMusic || musicDetails.musicName || '',
                            artist: musicDetails.artist || musicDetails.artistName || musicDetails.singer || '',
                            tone: userDetails.personalTone || userDetails.tom || userDetails.tone || '',
                            idUserMusic: userDetails.idUserMusic || musicDetails.idUserMusic,
                            ...m
                        };
                    });
                }

                this.closeAddModal();
            },
            error: (err) => console.error('Erro ao adicionar música', err)
        });
    }

    // REMOVE MUSIC
    removeMusic(music: any, event: MouseEvent) {
        event.stopPropagation();
        this.musicToRemove = music;
        this.showRemoveModal = true;
        this.openMenuIndex = null;
    }

    cancelRemove() {
        this.showRemoveModal = false;
        this.musicToRemove = null;
    }

    confirmRemove() {
        if (!this.musicToRemove) return;

        this.blockService.removeMusicFromBlock(this.idBlock, this.musicToRemove.idUserMusic).subscribe({
            next: () => {
                this.loadBlockData();
                this.cancelRemove();
            },
            error: (err) => console.error('Erro ao remover', err)
        });
    }

}
