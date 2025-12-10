describe('Notes App', () => {
  it('shows empty state when no notes', () => {
    cy.intercept('GET', '**/notes', {
      statusCode: 200,
      body: [],
    }).as('getNotes');

    cy.visit('/');
    cy.wait('@getNotes');

    cy.contains('No notes yet. Create one!').should('be.visible');
  });

  it('creates a new note', () => {
    cy.intercept('GET', '**/notes', {
      statusCode: 200,
      body: [],
    }).as('getNotesEmpty');

    cy.visit('/');
    cy.wait('@getNotesEmpty');

    cy.intercept('POST', '**/notes', (req) => {
      const body = JSON.parse(req.body.body);
      req.reply({
        statusCode: 200,
        body: {
          id: 'test-note-1',
          body: JSON.stringify({
            title: body.title,
            text: body.text,
            last_updated_at: new Date().toISOString(),
            is_deleted: false,
          }),
        },
      });
    }).as('createNote');

    cy.intercept('PUT', '**/notes/*', (req) => {
      const body = JSON.parse(req.body.body);
      req.reply({
        statusCode: 200,
        body: {
          id: 'test-note-1',
          body: JSON.stringify(body),
        },
      });
    }).as('updateNote');

    cy.contains('New Note').click();
    cy.url().should('include', '/edit/new');

    cy.get('[data-cy="note-title-input"]').type('Test Note');
    cy.get('[data-cy="mention-editor-input"]').type('This is test content');

    cy.wait('@createNote');
    cy.contains('Saved at').should('be.visible');

    cy.intercept('GET', '**/notes', {
      statusCode: 200,
      body: [{
        id: 'test-note-1',
        body: JSON.stringify({
          title: 'Test Note',
          text: 'This is test content',
          last_updated_at: new Date().toISOString(),
          is_deleted: false,
        }),
      }],
    }).as('getNotesWithNew');

    cy.contains('Back').click();

    cy.wait('@getNotesWithNew');
    cy.contains('Test Note').should('be.visible');
  });

  it('edits an existing note', () => {
    const noteId = 'edit-test-1';
    const originalNote = {
      id: noteId,
      body: JSON.stringify({
        title: 'Edit Test',
        text: 'Original content',
        last_updated_at: new Date().toISOString(),
        is_deleted: false,
      }),
    };

    cy.intercept('GET', '**/notes', {
      statusCode: 200,
      body: [originalNote],
    }).as('getNotes');

    cy.visit('/');
    cy.wait('@getNotes');

    cy.intercept('GET', `**/notes/${noteId}`, {
      statusCode: 200,
      body: originalNote,
    }).as('getNote');

    cy.intercept('POST', `**/notes`, (req) => {
      const body = JSON.parse(req.body.body);
      req.reply({
        statusCode: 200,
        body: {
          id: noteId,
          body: JSON.stringify(body),
        },
      });
    }).as('createNote');

    cy.intercept('PUT', `**/notes/${noteId}`, (req) => {
      const body = JSON.parse(req.body.body);
      req.reply({
        statusCode: 200,
        body: {
          id: noteId,
          body: JSON.stringify(body),
        },
      });
    }).as('updateNote');

    cy.contains('Edit Test').parent().parent().trigger('mouseover');
    cy.get('[data-cy="edit-note-button"]').first().click();

    cy.wait('@getNote');

    cy.get('[data-cy="note-title-input"]').clear().type('Updated Title');
    cy.wait('@updateNote');

    cy.intercept('GET', '**/notes', {
      statusCode: 200,
      body: [{
        id: noteId,
        body: JSON.stringify({
          title: 'Updated Title',
          text: 'Original content',
          last_updated_at: new Date().toISOString(),
          is_deleted: false,
        }),
      }],
    }).as('getNotesUpdated');

    cy.contains('Back').click();
    cy.wait('@updateNote');
    cy.wait('@getNotesUpdated');
    cy.contains('Updated Title').should('be.visible');
  });

  it('deletes a note from home page', () => {
    const noteId = 'delete-test-1';
    const noteToDelete = {
      id: noteId,
      body: JSON.stringify({
        title: 'Delete Test',
        text: 'To be deleted',
        last_updated_at: new Date().toISOString(),
        is_deleted: false,
      }),
    };

    cy.intercept('GET', '**/notes', {
      statusCode: 200,
      body: [noteToDelete],
    }).as('getNotes');

    cy.visit('/');
    cy.wait('@getNotes');

    cy.intercept('PUT', `**/notes/${noteId}`, {
      statusCode: 200,
      body: {
        id: noteId,
        body: JSON.stringify({
          title: 'Delete Test',
          text: 'To be deleted',
          last_updated_at: new Date().toISOString(),
          is_deleted: true,
        }),
      },
    }).as('deleteNote');

    cy.intercept('GET', '**/notes', {
      statusCode: 200,
      body: [],
    }).as('getNotesAfterDelete');

    cy.contains('Delete Test').parent().parent().trigger('mouseover');
    cy.get('[data-cy="delete-note-button"]').first().click();

    cy.contains('Delete Note?').should('be.visible');
    cy.contains('button', 'Delete').click();

    cy.wait('@deleteNote');

    cy.contains('Delete Test').should('not.exist');
  });

  it('deletes a note from edit page', () => {
    const noteId = 'delete-edit-test-1';
    const noteToDelete = {
      id: noteId,
      body: JSON.stringify({
        title: 'Delete From Edit',
        text: 'Content here',
        last_updated_at: new Date().toISOString(),
        is_deleted: false,
      }),
    };

    cy.intercept('GET', '**/notes', {
      statusCode: 200,
      body: [noteToDelete],
    }).as('getNotes');

    cy.visit('/');
    cy.wait('@getNotes');

    cy.intercept('GET', `**/notes/${noteId}`, {
      statusCode: 200,
      body: noteToDelete,
    }).as('getNote');

    cy.contains('Delete From Edit').parent().parent().trigger('mouseover');
    cy.get('[data-cy="edit-note-button"]').first().click();

    cy.wait('@getNote');

    cy.intercept('PUT', `**/notes/${noteId}`, {
      statusCode: 200,
      body: {
        id: noteId,
        body: JSON.stringify({
          title: 'Delete From Edit',
          text: 'Content here',
          last_updated_at: new Date().toISOString(),
          is_deleted: true,
        }),
      },
    }).as('deleteNote');

    cy.intercept('GET', '**/notes', {
      statusCode: 200,
      body: [],
    }).as('getNotesAfterDelete');

    cy.get('[data-cy="delete-note-button"]').click();
    cy.contains('button', 'Delete').click();

    cy.wait('@deleteNote');

    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Delete From Edit').should('not.exist');
  });

  it('shows 404 for invalid note ID', () => {
    cy.intercept('GET', '**/notes', {
      statusCode: 200,
      body: [],
    }).as('getNotes');

    cy.intercept('GET', '**/notes/invalid-id-12345', {
      statusCode: 404,
      body: { message: 'Note not found' },
    }).as('getNoteNotFound');

    cy.visit('/edit/invalid-id-12345');
    cy.wait('@getNoteNotFound');

    cy.contains('This note went on vacation').should('be.visible');
    cy.contains('Back to Home').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('manual save works', () => {
    cy.intercept('GET', '**/notes', {
      statusCode: 200,
      body: [],
    }).as('getNotes');

    cy.visit('/');
    cy.wait('@getNotes');

    cy.intercept('POST', '**/notes', (req) => {
      const body = JSON.parse(req.body.body);
      req.reply({
        delay: 500,
        statusCode: 200,
        body: {
          id: 'manual-save-test-1',
          body: JSON.stringify({
            title: body.title,
            text: body.text || '',
            last_updated_at: new Date().toISOString(),
            is_deleted: false,
          }),
        },
      });
    }).as('createNote');

    cy.intercept('PUT', '**/notes/*', (req) => {
      const body = JSON.parse(req.body.body);
      req.reply({
        statusCode: 200,
        body: {
          id: 'manual-save-test-1',
          body: JSON.stringify(body),
        },
      });
    }).as('updateNote');

    cy.contains('New Note').click();
    cy.get('[data-cy="note-title-input"]').type('Manual Save Test');

    cy.contains('button', 'Save').click();
    cy.contains('Saving...').should('be.visible');

    cy.wait('@createNote');
    cy.contains('Saved at').should('be.visible');
  });
});
