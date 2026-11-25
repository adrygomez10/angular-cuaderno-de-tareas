import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { App } from './app';
import { AppModule } from './app-module';
import { DEMO_PASSWORD, DEMO_SESSION_KEY, DEMO_USERNAME, DemoSession } from './auth/demo-session';
import { TASK_API_URL } from './services/task-api';
import { TASK_STORAGE_KEY } from './services/task-storage';
import { TaskStore } from './services/task-store';

describe('Lista de tareas', () => {
  let fixture: ComponentFixture<App>;
  let page: HTMLElement;
  let router: Router;

  beforeEach(async () => {
    localStorage.removeItem(TASK_STORAGE_KEY);
    sessionStorage.removeItem(DEMO_SESSION_KEY);

    await TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    page = fixture.nativeElement as HTMLElement;
    router = TestBed.inject(Router);

    await fixture.whenStable();
    await navigate('/');
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.removeItem(TASK_STORAGE_KEY);
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  });

  it('redirige a la lista y muestra el título y el contador inicial', () => {
    expect(router.url).toBe('/tareas');
    expect(page.querySelector('h1')?.textContent).toBe('Lista de tareas');
    expect(element('app-task-list').textContent).toContain('Aún no hay tareas');
    expect(element('app-task-list output').textContent).toContain('0 tareas');
  });

  it.each([
    { form: '#template-task-form', input: '#task-title', error: '#template-title-error' },
    { form: '#reactive-task-form', input: '#reactive-task-title', error: '#reactive-title-error' },
  ])('valida los títulos antes de enviar $form', async ({ form, input, error }) => {
    await navigate('/tareas/nueva');

    expect(submitButton(form).disabled).toBe(true);
    expect(element(error).textContent?.trim()).toBe('');

    await write('   ', input);
    expect(element(error).textContent).toContain('Escribe un título');

    await write('  a  ', input);
    expect(element(error).textContent).toContain('al menos 3 caracteres');
    expect(submitButton(form).disabled).toBe(true);

    await write('a'.repeat(121), input);
    expect(element(error).textContent).toContain('hasta 120 caracteres');
    expect(submitButton(form).disabled).toBe(true);

    element(form).dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(localStorage.getItem(TASK_STORAGE_KEY)).toBeNull();
  });

  it('añade una tarea desde la página de alta y conserva sus filas al actualizar la lista', async () => {
    await navigate('/tareas/nueva');
    await write('  Repasar Angular  ', '#task-title');
    expect(element('.title-preview strong').textContent).toContain('Repasar Angular');

    submitButton('#template-task-form').click();
    await fixture.whenStable();

    expect(element<HTMLInputElement>('#task-title').value).toBe('');
    expect(document.activeElement).toBe(element('#task-title'));
    expect(element('.route-notice').textContent).toContain('Repasar Angular');
    element('.route-notice a').click();
    await fixture.whenStable();

    const firstRow = element('app-task-list li');
    expect(firstRow.querySelector('.task-title')?.textContent).toBe('Repasar Angular');

    TestBed.inject(TaskStore).create('Practicar los hooks');
    await fixture.whenStable();

    expect(element('app-task-list li')).toBe(firstRow);
    expect(page.querySelectorAll('app-task-list li')).toHaveLength(2);
    expect(element('app-task-list output').textContent).toContain('2 tareas');
    expect(element('.event-list li').textContent).toContain('Tareas recibidas: 2.');
  });

  it('muestra estados reactivos y reinicia solo el formulario enviado', async () => {
    await navigate('/tareas/nueva');
    const reactiveTitle = '#reactive-task-title';
    expect(activeReactiveStates()).toEqual(['pristine', 'invalid']);

    await write('Borrador de plantilla', '#task-title');
    await write('Ac', reactiveTitle);
    expect(activeReactiveStates()).toEqual(['dirty', 'invalid']);

    await write('Revisar el formulario reactivo', reactiveTitle);
    expect(activeReactiveStates()).toEqual(['dirty', 'valid']);

    submitButton('#reactive-task-form').click();
    await fixture.whenStable();

    expect(element('.route-notice').textContent).toContain('Revisar el formulario reactivo');
    expect(activeReactiveStates()).toEqual(['pristine', 'invalid']);
    expect(element<HTMLInputElement>('#task-title').value).toBe('Borrador de plantilla');
    expect(document.activeElement).toBe(element(reactiveTitle));
  });

  it('conserva tareas y registra los hooks al cambiar de página u ocultar la lista', async () => {
    await addTask('Preparar la entrega');
    await navigate('/tareas');

    expect(eventComponents('ngOnDestroy')).toContain('add-task');

    element('button[aria-controls="task-components"]').click();
    await fixture.whenStable();

    expect(page.querySelector('app-task-list')).toBeNull();
    expect(eventComponents('ngOnDestroy')).toContain('task-list');

    element('button[aria-controls="task-components"]').click();
    await fixture.whenStable();

    expect(element('app-task-list .task-title').textContent).toBe('Preparar la entrega');
    expect(eventComponents('ngOnInit')).toContain('task-list');
  });

  it('abre el detalle y la edición mediante enlaces y guarda el título en LocalStorage', async () => {
    await addTask('Preparar la entrega');
    await navigate('/tareas');
    element('a[aria-label="Ver Preparar la entrega"]').click();
    await fixture.whenStable();

    expect(router.url).toBe('/tareas/1');
    expect(element('.task-detail').textContent).toContain('Preparar la entrega');

    element('a[href="/tareas/1/editar"]').click();
    await fixture.whenStable();
    expect(router.url).toBe('/tareas/1/editar');
    expect(element<HTMLInputElement>('app-task-edit-page input').value).toBe('Preparar la entrega');

    await write('Planificar la entrega', 'app-task-edit-page input');
    submitButton('app-task-edit-page form').click();
    await fixture.whenStable();

    expect(router.url).toBe('/tareas/1');
    expect(element('.task-detail').textContent).toContain('Planificar la entrega');
    expect(localStorage.getItem(TASK_STORAGE_KEY)).toContain('Planificar la entrega');

    await navigate('/tareas/999');
    expect(element('app-task-detail-page').textContent).toContain('No se ha encontrado');
  });

  it('exige una sesión válida, vuelve a la subruta solicitada y protege tras cerrar sesión', async () => {
    const trashPath = '/tareas/gestion/eliminadas';
    await navigate(trashPath);
    expect(router.url).toBe('/acceso?volver=%2Ftareas%2Fgestion%2Feliminadas');
    expect(page.querySelector('app-task-management')).toBeNull();

    await submitLogin('incorrecta');
    expect(element('app-login-page [role="alert"]').textContent).toContain('no coinciden');
    expect(page.querySelector('app-task-management')).toBeNull();

    await submitLogin(DEMO_PASSWORD);
    expect(router.url).toBe(trashPath);
    expect(element('#archive-heading').textContent).toBe('Tareas eliminadas');

    element('.session-status button').click();
    await fixture.whenStable();
    expect(router.url).toBe('/tareas');

    await navigate(trashPath);
    expect(router.url).toContain('/acceso?');
  });

  it('gestiona completadas y eliminadas y restaura una tarea a la lista', async () => {
    await addTask('Tarea para completar');
    await addTask('Tarea para restaurar');
    await navigate('/tareas');

    element('app-task-list input[type="checkbox"]').click();
    element('button[aria-label="Eliminar Tarea para restaurar"]').click();
    await fixture.whenStable();

    expect(page.querySelectorAll('app-task-list li')).toHaveLength(1);
    expect(localStorage.getItem(TASK_STORAGE_KEY)).toContain('"deleted":true');
    expect(element('.last-change strong').textContent).toBe('Tarea eliminada');

    TestBed.inject(DemoSession).signIn(DEMO_USERNAME, DEMO_PASSWORD);
    await navigate('/tareas/gestion/completadas');
    expect(element('.archive-list').textContent).toContain('Tarea para completar');
    element('.archive-list button').click();
    await fixture.whenStable();
    expect(element('.archive-list').textContent).toContain('no hay tareas completadas');

    element('.management-nav a[href="/tareas/gestion/eliminadas"]').click();
    await fixture.whenStable();
    expect(element('.archive-list').textContent).toContain('Tarea para restaurar');
    element('.archive-list button').click();
    await fixture.whenStable();
    expect(element('.archive-list').textContent).toContain('La papelera está vacía');
    expect(element('.last-change strong').textContent).toBe('Tarea restaurada');

    await navigate('/tareas');
    expect(page.querySelectorAll('app-task-list li')).toHaveLength(2);
  });

  it('importa hasta cinco pendientes de la API y evita duplicados', async () => {
    const response = [
      { id: 1, title: 'Ya completada', completed: true },
      { id: 2, title: '  ', completed: false },
      ...Array.from({ length: 6 }, (_, index) => ({
        id: index + 3,
        title: `  Pendiente ${index + 1}  `,
        completed: false,
      })),
    ];

    importRequest().flush(response);
    await fixture.whenStable();
    expect(element('.import-status').textContent).toContain('Se importaron 5 tareas');
    expect(element('.last-change strong').textContent).toBe('Tareas importadas');
    expect(page.querySelectorAll('app-task-list li')).toHaveLength(5);
    expect(element('app-task-list .task-title').textContent).toBe('Pendiente 1');

    importRequest().flush(response);
    await fixture.whenStable();
    expect(element('.import-status').textContent).toContain('ya están en tu lista');
    expect(page.querySelectorAll('app-task-list li')).toHaveLength(5);
  });

  it('avisa si el GET falla y permite reintentar sin alterar las tareas locales', async () => {
    await addTask('Tarea local');
    await navigate('/tareas');
    importRequest().flush(null, { status: 503, statusText: 'Service Unavailable' });
    await fixture.whenStable();
    expect(element('.import-status').textContent).toContain('No se pudieron consultar');
    expect(element('app-task-list .task-title').textContent).toBe('Tarea local');

    importRequest().flush([{ id: 3, title: 'Remota pendiente', completed: false }]);
    await fixture.whenStable();
    expect(element('.import-status').textContent).toContain('Se importó 1 tarea');
    expect(page.querySelectorAll('app-task-list li')).toHaveLength(2);
  });

  async function navigate(url: string): Promise<void> {
    await router.navigateByUrl(url);
    await fixture.whenStable();
  }

  function element<T extends HTMLElement = HTMLElement>(selector: string): T {
    const target = page.querySelector<T>(selector);
    if (!target) {
      throw new Error(`No se encontró ${selector} en la vista de prueba.`);
    }

    return target;
  }

  async function write(value: string, selector: string): Promise<void> {
    const field = element<HTMLInputElement>(selector);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
  }

  async function addTask(title: string): Promise<void> {
    await navigate('/tareas/nueva');
    await write(title, '#task-title');
    submitButton('#template-task-form').click();
    await fixture.whenStable();
  }

  async function submitLogin(password: string): Promise<void> {
    await write(DEMO_USERNAME, 'app-login-page input[name="username"]');
    await write(password, 'app-login-page input[name="password"]');
    submitButton('app-login-page form').click();
    await fixture.whenStable();
  }

  function submitButton(form: string): HTMLButtonElement {
    return element<HTMLButtonElement>(`${form} button[type="submit"]`);
  }

  function importRequest() {
    element('.api-panel button').click();
    return TestBed.inject(HttpTestingController).expectOne({
      method: 'GET',
      url: `${TASK_API_URL}?_limit=12`,
    });
  }

  function activeReactiveStates(): (string | null)[] {
    return Array.from(
      page.querySelectorAll('.control-states .active dt'),
      (term) => term.textContent,
    );
  }

  function eventComponents(hook: string): string[] {
    return Array.from(page.querySelectorAll('.event-list li'))
      .filter((item) => item.querySelector('code')?.textContent === hook)
      .map((item) => item.querySelector('.event-component')?.textContent ?? '')
      .sort();
  }
});
