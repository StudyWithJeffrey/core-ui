import { Component, OnInit, ViewChild } from '@angular/core';
import {
  WorkflowTemplateDetail,
  WorkflowTemplateService
} from '../workflow-template.service';
import { DagComponent } from '../../dag/dag.component';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { NodeRenderer } from '../../node/node.service';
import { WorkflowService } from "../../workflow/workflow.service";
import { WorkflowTemplateSelected } from "../../workflow-template-select/workflow-template-select.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Alert } from "../../alert/alert.component";
import { HttpErrorResponse } from "@angular/common/http";
import { AceEditorComponent } from "ng2-ace-editor";
import * as yaml from 'js-yaml';
import * as ace from 'brace';
const aceRange = ace.acequire('ace/range').Range;

@Component({
  selector: 'app-workflow-template-create',
  templateUrl: './workflow-template-create.component.html',
  styleUrls: ['./workflow-template-create.component.scss'],
  providers: [WorkflowService, WorkflowTemplateService]
})
export class WorkflowTemplateCreateComponent implements OnInit {
  @ViewChild(AceEditorComponent, {static:false}) codeEditor: AceEditorComponent;
  @ViewChild(DagComponent, {static: false}) dag: DagComponent;

  previousManifestText: string;
  manifestText: string;
  manifestTextCurrent: string;
  serverError: Alert;

  namespace: string;
  uid: string;

  templateNameInput: AbstractControl;
  form: FormGroup;

  private errorMarkerId;

  private workflowTemplateDetail: WorkflowTemplateDetail;

  get workflowTemplate(): WorkflowTemplateDetail {
    return this.workflowTemplateDetail;
  }

  set workflowTemplate(value: WorkflowTemplateDetail) {
    if (!this.dag) {
      setTimeout( () => this.workflowTemplate = value, 500);
      return;
    }

    this.workflowTemplateDetail = value;
    const g = NodeRenderer.createGraphFromManifest(value.manifest);
    this.dag.display(g);

    this.manifestText = value.manifest;
    this.manifestTextCurrent = value.manifest;
  }

  constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      private activatedRoute: ActivatedRoute,
      private workflowService: WorkflowService,
      private workflowTemplateService: WorkflowTemplateService,
      private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      templateNameInput: [
        '',
        Validators.compose([
          Validators.required,
        ]),
      ]});

    this.templateNameInput = this.form.get('templateNameInput');

    this.activatedRoute.paramMap.subscribe(next => {
      this.namespace = next.get('namespace');
      this.uid = next.get('uid');

      this.getWorkflowTemplate();
    });
  }

  getWorkflowTemplate() {
    this.workflowTemplateService.getWorkflowTemplate(this.namespace, this.uid)
        .subscribe(res => {
          this.workflowTemplate = res;
        });
  }

  onManifestChange(newManifest: string) {
    this.manifestTextCurrent = newManifest;

    if(newManifest === '') {
      this.dag.clear();
      return;
    }

    if(this.errorMarkerId) {
      this.codeEditor.getEditor().session.removeMarker(this.errorMarkerId)
    }

    try {
      const g = NodeRenderer.createGraphFromManifest(newManifest);
      this.dag.display(g);
      setTimeout( () => {
        this.serverError = null;
      });
    } catch (e) {
      if(e instanceof yaml.YAMLException) {
        const line = e.mark.line + 1;
        const column = e.mark.column + 1;

        const codeErrorRange = new aceRange(line - 1, 0, line - 1, column);
        this.errorMarkerId = this.codeEditor.getEditor().session.addMarker(codeErrorRange, "highlight-error", "fullLine");

        this.serverError = {
          message: e.reason + " at line: " + line + " column: " + column,
          type: 'danger'
        };
      }
    }
  }

  save() {
    const templateName = this.templateNameInput.value;

    if(!templateName) {
      this.snackBar.open('Unable to update - template name is invalid', 'OK');

      return;
    }

    this.workflowTemplateService
        .create(this.namespace, {
          name: templateName,
          manifest: this.manifestTextCurrent,
        })
        .subscribe(res => {
          this.router.navigate(['/', this.namespace, 'workflow-templates', res.uid]);
        }, (err: HttpErrorResponse) => {
          this.serverError = {
            message: err.error.message,
            type: 'danger',
          };
    });
  }

  cancel() {
    this.router.navigate(['/', this.namespace, 'workflow-templates']);
  }

  onTemplateSelected(template: WorkflowTemplateSelected) {
    if(!this.manifestTextCurrent) {
      this.manifestText = template.manifest;
      this.manifestTextCurrent = template.manifest;
      return;
    }

    this.previousManifestText = this.manifestTextCurrent;
    this.manifestText = template.manifest;
    this.manifestTextCurrent = template.manifest;

    const snackUndo = this.snackBar.open('Your manifest has been updated.', 'Undo', {
      duration: 5000,
    });

    snackUndo.onAction().subscribe(res => {
      this.manifestText = this.previousManifestText;
      this.manifestTextCurrent = this.previousManifestText;
    })
  }
}
