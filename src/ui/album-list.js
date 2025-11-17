// @ts-nocheck
/**
 * ALBUM LIST COMPONENT
 * Displays albums grouped by date with drag-drop reordering support
 */

/**
 * AlbumListComponent - Renders album list with groups
 */
class AlbumListComponent {
  /**
   * @param {object} options
   * @param {HTMLElement} options.container - Container element
   * @param {AlbumManager} options.albumManager - Album manager instance
   * @param {AppState} options.appState - App state instance
   * @param {Function} options.onAlbumSelect - Callback when album selected
   * @param {Function} options.onAlbumReorder - Callback when albums reordered
   */
  constructor({ container, albumManager, appState, onAlbumSelect, onAlbumReorder }) {
    this.container = container;
    this.albumManager = albumManager;
    this.appState = appState;
    this.onAlbumSelect = onAlbumSelect;
    this.onAlbumReorder = onAlbumReorder;
    this.draggedAlbum = null;
    this.draggedOverGroup = null;
  }

  /**
   * Render album list
   * @param {object[]} groups - Groups with albums
   * @returns {void}
   */
  render(groups) {
    this.container.innerHTML = '';

    const listElement = document.createElement('div');
    listElement.className = 'album-list';
    listElement.setAttribute('role', 'region');
    listElement.setAttribute('aria-label', 'Album Groups');

    if (groups.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'album-list__empty';
      emptyState.innerHTML = `
        <p class="album-list__empty-text">No albums yet. Start by creating an album or uploading photos.</p>
      `;
      listElement.appendChild(emptyState);
      this.container.appendChild(listElement);
      return;
    }

    groups.forEach((group) => {
      const groupElement = this._renderGroup(group);
      listElement.appendChild(groupElement);
    });

    this.container.appendChild(listElement);
  }

  /**
   * Render a group with its albums
   * @private
   */
  _renderGroup(group) {
    const groupElement = document.createElement('div');
    groupElement.className = 'album-group';
    groupElement.setAttribute('data-group-date', group.group_date);

    const groupHeader = document.createElement('h2');
    groupHeader.className = 'album-group__header';
    groupElement.appendChild(groupHeader);

    const groupTitle = document.createElement('span');
    groupTitle.className = 'album-group__title';
    groupTitle.textContent = this._formatGroupDate(group.group_date);
    groupHeader.appendChild(groupTitle);

    const groupCount = document.createElement('span');
    groupCount.className = 'album-group__count';
    groupCount.textContent = `${group.count} album${group.count !== 1 ? 's' : ''}`;
    groupHeader.appendChild(groupCount);

    const albumsContainer = document.createElement('div');
    albumsContainer.className = 'album-group__albums';
    albumsContainer.setAttribute('data-group', group.group_date);
    albumsContainer.setAttribute('role', 'list');

    group.albums.forEach((album) => {
      const albumElement = this._renderAlbumCard(album, group.group_date);
      albumsContainer.appendChild(albumElement);
    });

    groupElement.appendChild(albumsContainer);
    return groupElement;
  }

  /**
   * Render album card
   * @private
   */
  _renderAlbumCard(album, groupDate) {
    const albumElement = document.createElement('div');
    albumElement.className = 'album-card';
    albumElement.setAttribute('data-album-id', album.id);
    albumElement.setAttribute('data-group', groupDate);
    albumElement.setAttribute('role', 'listitem');
    albumElement.setAttribute('tabindex', '0');
    albumElement.draggable = true;

    // Album header with title
    const header = document.createElement('div');
    header.className = 'album-card__header';

    const title = document.createElement('h3');
    title.className = 'album-card__title';
    title.textContent = album.name;
    header.appendChild(title);

    albumElement.appendChild(header);

    // Album content area
    const content = document.createElement('div');
    content.className = 'album-card__content';
    const photoCount = album.photo_count || 0;
    const photoText = photoCount === 1 ? '1 photo' : `${photoCount} photos`;
    content.innerHTML = `
      <div class="album-card__meta">
        <span class="album-card__date">${this._formatDate(album.created_at || Date.now())}</span>
        <span class="album-card__count" data-album-id="${album.id}">${photoText}</span>
      </div>
    `;
    albumElement.appendChild(content);

    // Album actions
    const actions = document.createElement('div');
    actions.className = 'album-card__actions';

    const viewButton = document.createElement('button');
    viewButton.className = 'album-card__action album-card__action--view';
    viewButton.setAttribute('aria-label', `View album ${album.name}`);
    viewButton.textContent = 'View';
    viewButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.onAlbumSelect?.(album);
    });
    actions.appendChild(viewButton);

    const editButton = document.createElement('button');
    editButton.className = 'album-card__action album-card__action--edit';
    editButton.setAttribute('aria-label', `Edit album ${album.name}`);
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleEditAlbum(album);
    });
    actions.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'album-card__action album-card__action--delete';
    deleteButton.setAttribute('aria-label', `Delete album ${album.name}`);
    deleteButton.innerHTML = '×';
    deleteButton.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleDeleteAlbum(album);
    });
    actions.appendChild(deleteButton);

    albumElement.appendChild(actions);

    // Drag event handlers
    albumElement.addEventListener('dragstart', (e) => this._handleDragStart(e, album, groupDate));
    albumElement.addEventListener('dragend', (e) => this._handleDragEnd(e));
    albumElement.addEventListener('dragover', (e) => this._handleDragOver(e));
    albumElement.addEventListener('drop', (e) => this._handleDrop(e, groupDate));
    albumElement.addEventListener('dragleave', (e) => this._handleDragLeave(e));

    // Click handlers
    albumElement.addEventListener('click', () => this.onAlbumSelect?.(album));
    albumElement.addEventListener('keydown', (e) => this._handleKeyboardNav(e, album));

    return albumElement;
  }

  /**
   * Handle drag start
   * @private
   */
  _handleDragStart(event, album, groupDate) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify({ album, groupDate }));
    event.target.classList.add('album-card--dragging');
    this.draggedAlbum = album;
  }

  /**
   * Handle drag end
   * @private
   */
  _handleDragEnd(event) {
    event.target.classList.remove('album-card--dragging');
    this.draggedAlbum = null;
  }

  /**
   * Handle drag over
   * @private
   */
  _handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.target.closest('.album-card')?.classList.add('album-card--drag-over');
  }

  /**
   * Handle drag leave
   * @private
   */
  _handleDragLeave(event) {
    event.target.closest('.album-card')?.classList.remove('album-card--drag-over');
  }

  /**
   * Handle drop
   * @private
   */
  _handleDrop(event, groupDate) {
    event.preventDefault();
    const targetCard = event.target.closest('.album-card');
    targetCard?.classList.remove('album-card--drag-over');

    const data = JSON.parse(event.dataTransfer.getData('application/json'));
    const draggedAlbum = data.album;
    const targetAlbum = this.container.querySelector(
      `[data-album-id="${targetCard?.dataset.albumId}"]`
    )?.parentElement;

    if (!draggedAlbum || !targetAlbum) return;

    this.onAlbumReorder?.({
      draggedAlbum,
      targetAlbum: targetCard?.dataset,
      groupDate,
    });
  }

  /**
   * Handle keyboard navigation
   * @private
   */
  _handleKeyboardNav(event, album) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onAlbumSelect?.(album);
    }
  }

  /**
   * Handle edit album
   * @private
   */
  _handleEditAlbum(album) {
    const newName = prompt('Album name:', album.name);
    if (newName && newName.trim()) {
      this.albumManager.updateAlbum(album.id, { name: newName.trim() });
      this._refreshAfterAction();
    }
  }

  /**
   * Handle delete album
   * @private
   */
  _handleDeleteAlbum(album) {
    if (confirm(`Delete album "${album.name}" and all its photos?`)) {
      this.albumManager.deleteAlbum(album.id);
      this._refreshAfterAction();
    }
  }

  /**
   * Refresh album list after action
   * @private
   */
  _refreshAfterAction() {
    const groups = this.albumManager.getGroups();
    this.render(groups);
  }

  /**
   * Format group date
   * @private
   */
  _formatGroupDate(groupDate) {
    const [year, month] = groupDate.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /**
   * Format creation date
   * @private
   */
  _formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export { AlbumListComponent };
