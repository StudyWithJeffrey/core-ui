import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NodeInfo, NodeStatus } from '../node/node.service';
import { SimpleWorkflowDetail, } from "../workflow/workflow.service";

@Component({
  selector: 'app-node-info',
  templateUrl: './node-info.component.html',
  styleUrls: ['./node-info.component.scss']
})
export class NodeInfoComponent implements OnInit, OnDestroy {
  @Input() workflow: SimpleWorkflowDetail;
  @Output() closeClicked = new EventEmitter();
  private node: NodeStatus;

  startedAt = null;
  finishedAt = null;
  status: string;

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  updateNodeStatus(node: NodeStatus) {
    this.node = node;

    if(node.startedAt) {
      this.startedAt = new Date(node.startedAt);
    }

    if(node.finishedAt) {
      this.finishedAt = new Date(node.finishedAt);
    }

    this.status = node.phase;
  }

  onCloseClick() {
    this.closeClicked.emit();
  }
}
