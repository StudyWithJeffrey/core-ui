import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NodeInfo, NodeStatus } from '../node/node.service';
import { SimpleWorkflowDetail, WorkflowPhase, WorkflowService, } from "../workflow/workflow.service";
import * as yaml from 'js-yaml';
import { TemplateDefinition } from "../workflow-template/workflow-template.service";

@Component({
  selector: 'app-node-info',
  templateUrl: './node-info.component.html',
  styleUrls: ['./node-info.component.scss'],
  providers: [WorkflowService]
})
export class NodeInfoComponent implements OnInit, OnDestroy {
  @Input() namespace: string;
  @Input() name: string;

  @Input() visible = true;
  @Input() workflow: SimpleWorkflowDetail;
  @Output() yamlClicked = new EventEmitter();
  @Output() closeClicked = new EventEmitter();
  @Output() logsClicked = new EventEmitter();

  protected node: NodeStatus;

  startedAt = null;
  finishedAt = null;
  status: WorkflowPhase;
  message: string;
  logsAvailable: boolean = false;
  statusClass = {};
  inputParameters = [];
  outputParameters = [];
  inputArtifacts = [];
  outputArtifacts = [];

  parametersExpanded = false;
  containersExpanded = false;
  artifactsExpanded = false;
  template: TemplateDefinition;

  constructor(private workflowService: WorkflowService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  updateNodeStatus(node: NodeStatus) {
    let loaded = null;

    this.inputParameters = [];
    this.inputArtifacts = [];

    this.node = node;

    if(node.startedAt) {
      this.startedAt = new Date(node.startedAt);
    } else {
      this.startedAt = node.startedAt;
    }

    if(node.finishedAt) {
      this.finishedAt = new Date(node.finishedAt);
    } else {
      // Error phase has no finished date
      if (node.phase === 'Error') {
        this.finishedAt = node.startedAt;
      } else {
        this.finishedAt = node.finishedAt;
      }
    }

    this.status = node.phase;
    this.message = node.message;

    this.statusClass = {
      'font-primary': ['Pending', 'Running'].indexOf(this.status) > -1,
      'font-success': this.status === 'Succeeded'
    };

    this.logsAvailable = node.type === 'Pod';

    try {
      const manifest = this.workflow.manifest;
      loaded = yaml.safeLoad(manifest);
      for (let template of loaded.spec.templates) {
        if (template.name === node.templateName) {
          this.template = template;
        }
      }
    } catch (e) {
      this.template = null;
    }

    if ((node.type === 'DAG' || node.type === 'Steps')
      && node.templateName === loaded.spec.entrypoint
      && loaded && loaded.spec.arguments.parameters) {
      this.inputParameters = loaded.spec.arguments.parameters;
    } else if (node.type == 'Pod' && node.inputs) {
      this.inputParameters = node.inputs.parameters;
      this.outputArtifacts = node.inputs.artifacts;
    }


    if (node.type !== 'DAG' && node.type !== 'Steps' && node.outputs) {
      this.outputParameters = node.outputs.parameters;
      this.outputArtifacts = node.outputs.artifacts;
    }
  }

  onCloseClick() {
    this.closeClicked.emit();
  }

  openYaml() {
    this.yamlClicked.emit();
  }

  openLogs() {
    this.logsClicked.emit();
  }

  onParametersExpandChange(expanded: boolean) {
    this.parametersExpanded = expanded;
  }

  onContainersExpandChange(expanded: boolean) {
    this.containersExpanded = expanded;
  }

  onArtifactsExpandChange(expanded: boolean) {
    this.artifactsExpanded = expanded;
  }

  downloadArtifact(artifact: any) {
    if(!artifact.s3) {
      return;
    }

    const key = artifact.s3.key;
    const extension = this.getArtifactExtension(key);

    this.workflowService.getArtifact(this.namespace, this.name, key)
        .subscribe((res: any) => {
          const link = <HTMLAnchorElement>document.createElement('a');

          link.download = `${this.namespace}-${this.name}-${artifact.name}.${extension}`;
          link.href = 'data:application/octet-stream;charset=utf-16le;base64,' + res.data;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
  }

  getArtifactExtension(key: string): string {
    const lastSlashIndex = key.lastIndexOf('/');
    const lastDotIndex = key.indexOf('.', lastSlashIndex);

    return key.substring(lastDotIndex + 1);
  }
}
