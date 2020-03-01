import { Component, Input, EventEmitter, Output } from '@angular/core';

import { ImageFileViewComponent } from '../image-file-view/image-file-view.component';
import { ModelFile } from "../../../../api";
import { FileActionEvent } from "../../file-navigator/file-navigator.component";

@Component({
  selector: 'app-generic-file-view',
  templateUrl: './generic-file-view.component.html',
  styleUrls: ['./generic-file-view.component.scss'],
})
export class GenericFileViewComponent {
  public static IsFileTooBigToDisplay(file: ModelFile): boolean {
    let size = 0;
    if(file.size) {
      size = parseInt(file.size);
    }

    if (ImageFileViewComponent.Supports(file)) {
      return size > GenericFileViewComponent.MAX_IMAGE_FILE_SIZE;
    }

    return size > GenericFileViewComponent.BIG_FILE_SIZE;
  }

  public static BIG_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  public static MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  private fileType: string = 'unknown';

  _file: ModelFile = null;

  @Input() showDownload: boolean = true;
  @Output() actionClick = new EventEmitter<FileActionEvent>();

  constructor() {}

  @Input() set file(file: ModelFile) {
    this._file = file;
    this.fileType =  this.getFileType();
    this.updateShouldShow();
  }

  @Input() namespace: string;
  @Input() name: string;
  @Output() loading = new EventEmitter<boolean>();

  onToolbarAction(event: any) {
    this.actionClick.emit(event);
  }

  getFileType(): string {
    this.loading.emit(false);
    return 'big-file';
    const extension = this._file.extension;

    if (GenericFileViewComponent.IsFileTooBigToDisplay(this._file)) {
      return 'big-file';
    }

    if (extension.includes('zip') || extension.includes('gz')) {
      return 'big-file';
    }

    if (ImageFileViewComponent.Supports(this._file)) {
      return 'image';
    }

    return 'text';
  }

  private updateShouldShow() {
  }

  onLoadingChange(value: boolean) {
    this.loading.emit(value);
  }

  onFileAction(e: FileActionEvent) {
    this.actionClick.emit(e);
  }
}
