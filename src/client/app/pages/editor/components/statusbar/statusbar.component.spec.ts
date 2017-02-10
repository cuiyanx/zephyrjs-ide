import { Component } from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';

import { EDITOR_STATUS, EditorTab } from '../../editor.tab';
import { StatusBarModule } from './statusbar.module';


export function main() {
   describe('Statusbar component', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [StatusBarModule]
      });
    });

    it('should work',
      async(() => {
        TestBed
          .compileComponents()
          .then(() => {
            let fixture = TestBed.createComponent(TestComponent);
            let el = fixture.debugElement.children[0].nativeElement;
            let testComponent = fixture.debugElement.children[0].componentInstance;

            fixture.detectChanges();
            expect(el.querySelectorAll('.statusbar')[0].textContent)
                .toContain('Unknown status.');
            expect(el.querySelectorAll('.statusbar')[0].className)
                .toContain('error');

            testComponent.tab.editorStatus = EDITOR_STATUS.WEBUSB_UNAVAILABLE;
            fixture.detectChanges();
            expect(el.querySelectorAll('.statusbar')[0].textContent)
                .toContain('Your browser does not support WebUSB.');
            expect(el.querySelectorAll('.statusbar')[0].className)
                .toContain('error');

            testComponent.tab.editorStatus = EDITOR_STATUS.READY;
            fixture.detectChanges();
            expect(el.querySelectorAll('.statusbar')[0].textContent)
                .toContain('Ready.');
            expect(el.querySelectorAll('.statusbar')[0].className)
                .toContain('info');
          });
        }));
    });
}

@Component({
  selector: 'test-cmp',
  template: '<sd-statusbar [tab]="tab"></sd-statusbar>'
})
class TestComponent {
    public tab: EditorTab = {
        id: 1,
        active: true,
        title: 'Tab # 1',
        editor: null,
        port: null,
        term: null
    };
}
