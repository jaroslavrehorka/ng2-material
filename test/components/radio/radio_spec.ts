import {
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEach,
  beforeEachProviders,
  describe,
  expect,
  inject,
  it,
} from 'angular2/testing_internal';
import {DebugElement} from 'angular2/src/core/debug/debug_element';
import {Component, View, provide} from 'angular2/core';
import {UrlResolver} from 'angular2/compiler';
import {TestUrlResolver} from '../../test_url_resolver';
import {MdRadioGroup, MdRadioButton} from '../../../ng2-material/components/radio/radio_button';
import {MATERIAL_PROVIDERS} from '../../../ng2-material/all';
import {ComponentFixture} from "angular2/testing";
import {findChildByTag} from "../../util";
import {findChildById} from "../../util";


export function main() {


  @Component({selector: 'test-app'})
  @View({
    directives: [MdRadioGroup, MdRadioButton],
    template: `
    <md-radio-group (click)="onClick($event)" [(value)]="selected">
      <md-radio-button value="Apple" class="md-primary">Apple</md-radio-button>
      <md-radio-button value="Banana" checked="true"> Banana</md-radio-button>
    </md-radio-group>`
  })
  class TestComponent {
    selected: string = 'Banana';
    clicks: number = 0;

    onClick() {
      this.clicks++;
    }
  }

  describe('Radios', () => {
    let builder: TestComponentBuilder;

    function setup(template: string = null, typeFn: any = TestComponent): Promise<ComponentFixture> {
      return template ?
        builder.overrideTemplate(typeFn, template).createAsync(typeFn) :
        builder.createAsync(typeFn);
    }

    beforeEachProviders(() => [
      MATERIAL_PROVIDERS,
      provide(UrlResolver, {useValue: new TestUrlResolver()}),
    ]);
    beforeEach(inject([TestComponentBuilder], (tcb) => {
      builder = tcb;
    }));

    describe('md-radio-group', () => {
      it('should set value from initial binding', inject([AsyncTestCompleter], (async) => {
        builder.createAsync(TestComponent).then(fixture => {
          fixture.detectChanges();
          let radioGroup = <MdRadioGroup>findChildByTag(fixture.debugElement, 'md-radio-group').componentInstance;
          expect(radioGroup.value).toBe('Banana');
          async.done();
        });
      }));
      it('should only have one selected child at a time', inject([AsyncTestCompleter], (async) => {
        let template = `
            <md-radio-group>
              <md-radio-button id="rdo1" value="Apple"></md-radio-button>
              <md-radio-button id="rdo2" value="Banana"></md-radio-button>
            </md-radio-group>`;
        setup(template).then((fixture: ComponentFixture) => {
          let radio = findChildById(fixture.debugElement, 'rdo1');
          let radio2 = findChildById(fixture.debugElement, 'rdo2');
          let group = <MdRadioGroup>findChildByTag(fixture.debugElement, 'md-radio-group').componentInstance;
          expect(group.value).toBeFalsy();

          radio.nativeElement.click();
          expect(radio.componentInstance.checked).toBe(true);
          expect(radio2.componentInstance.checked).toBe(false);
          expect(group.value).toBe('Apple');

          radio2.nativeElement.click();
          expect(radio2.componentInstance.checked).toBe(true);
          expect(radio.componentInstance.checked).toBe(false);
          expect(group.value).toBe('Banana');
          async.done();
        });
      }));
      it('should select a child by value when value is set on group', inject([AsyncTestCompleter], (async) => {
        let template = `
            <md-radio-group>
              <md-radio-button id="rdo1" value="Apple"></md-radio-button>
              <md-radio-button id="rdo2" value="Banana"></md-radio-button>
            </md-radio-group>`;
        setup(template).then((fixture: ComponentFixture) => {
          let radio = findChildById(fixture.debugElement, 'rdo1');
          let radio2 = findChildById(fixture.debugElement, 'rdo2');
          let group = <MdRadioGroup>findChildByTag(fixture.debugElement, 'md-radio-group').componentInstance;
          expect(group.value).toBeFalsy();
          expect(radio.componentInstance.checked).toBe(false);
          group.value = "Apple";
          fixture.detectChanges();
          expect(radio.componentInstance.checked).toBe(true);
          expect(group.value).toBe('Apple');
          async.done();
        });
      }));
      it('should disable child radio buttons when disabled', inject([AsyncTestCompleter], (async) => {
        var template = `
            <md-radio-group disabled>
              <md-radio-button>Apple</md-radio-button>
            </md-radio-group>`;
        setup(template).then((fixture: ComponentFixture) => {
          fixture.detectChanges();
          let radioGroup = <MdRadioGroup>findChildByTag(fixture.debugElement, 'md-radio-group').componentInstance;
          expect(radioGroup.disabled).toBe(true);

          let radio = <MdRadioButton>findChildByTag(fixture.debugElement, 'md-radio-button').componentInstance;
          expect(radio.disabled).toBe(true);
          async.done();
        });
      }));
    });

    describe('md-radio-button', () => {
      it('should not propagate click events when disabled', inject([AsyncTestCompleter], (async) => {
        // Template that will disable the radio item after it has been clicked once.
        let template = `
            <md-radio-group (click)="onClick($event)">
              <md-radio-button [disabled]="clicks > 0" value="Apple">Apple</md-radio-button>
            </md-radio-group>`;
        setup(template).then((fixture: ComponentFixture) => {
          let app: TestComponent = fixture.debugElement.componentInstance;
          fixture.detectChanges();
          let radio = findChildByTag(fixture.debugElement, 'md-radio-button');
          expect(app.clicks).toBe(0);
          radio.nativeElement.click();
          expect(app.clicks).toBe(1);
          fixture.detectChanges();
          radio.nativeElement.click();
          expect(app.clicks).toBe(1);
          async.done();
        });
      }));
      it('should not be selectable when disabled', inject([AsyncTestCompleter], (async) => {
        let template = `
            <md-radio-group>
              <md-radio-button disabled value="Apple">Apple</md-radio-button>
            </md-radio-group>`;
        setup(template).then((fixture: ComponentFixture) => {
          let radio = findChildByTag(fixture.debugElement, 'md-radio-button');
          let group = <MdRadioGroup>findChildByTag(fixture.debugElement, 'md-radio-group').componentInstance;
          expect(group.getSelectedRadioIndex()).toBe(-1);
          fixture.detectChanges();
          radio.nativeElement.click();
          fixture.detectChanges();
          expect(group.getSelectedRadioIndex()).toBe(-1);
          async.done();
        });
      }));

      it('should update parent group value when when selected', inject([AsyncTestCompleter], (async) => {
        let template = `
            <md-radio-group>
              <md-radio-button value="Apple">Apple</md-radio-button>
            </md-radio-group>`;
        setup(template).then((fixture: ComponentFixture) => {
          let radio = findChildByTag(fixture.debugElement, 'md-radio-button');
          let group = <MdRadioGroup>findChildByTag(fixture.debugElement, 'md-radio-group').componentInstance;
          expect(group.value).toBeFalsy();
          radio.nativeElement.click();
          expect(group.value).toBe('Apple');
          async.done();
        });
      }));
    });

  });


}

