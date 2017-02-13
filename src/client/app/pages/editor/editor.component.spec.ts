// Core
import { Component } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';

// Third-party
import { ResourceModule } from 'ng2-resource-rest';

// Own
import { EditorModule } from './editor.module';


export function main() {
   describe('Editor component', () => {
    // Setting module for testing
    // Disable old forms

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [EditorModule, ResourceModule]
      });
    });

    it('should work',
      async(() => {
        TestBed
          .compileComponents()
          .then(() => {
            let fixture = TestBed.createComponent(TestComponent);
            // tslint:disable-next-line:no-unused-variable
            let editorDOMEl = fixture.debugElement.children[0].nativeElement;

            // TODO: test
          });
        }));
    });
}

@Component({
  selector: 'test-cmp',
  template: '<sd-editor></sd-editor>'
})
class TestComponent {}
