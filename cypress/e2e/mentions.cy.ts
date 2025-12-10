describe('MentionEditor', () => {
  const mockUsers = [
    { username: 'johndoe', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
    { username: 'janedoe', first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' },
    { username: 'bobsmith', first_name: 'Bob', last_name: 'Smith', email: 'bob@example.com' },
    { username: 'alicedoe', first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com' },
  ];

  beforeEach(() => {
    cy.intercept('GET', '**/notes', {
      statusCode: 200,
      body: [],
    }).as('getNotes');

    cy.intercept('GET', 'https://challenge.surfe.com/users', {
      statusCode: 200,
      body: mockUsers,
    }).as('getUsers');

    cy.intercept('POST', '**/notes', (req) => {
      const body = JSON.parse(req.body.body);
      req.reply({
        statusCode: 200,
        body: {
          id: 'test-note-1',
          body: JSON.stringify({
            title: body.title || '',
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
          id: 'test-note-1',
          body: JSON.stringify(body),
        },
      });
    }).as('updateNote');

    cy.visit('/');
    cy.wait('@getNotes');
    cy.contains('New Note').click();
  });

  describe('1. Typing @ at Empty Form', () => {
    it('should open dropdown when typing @ in empty editor', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-dropdown"]').should('be.visible');
    });

    it('should show all users when dropdown opens', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-option"]').should('have.length', 4);
      cy.contains('@johndoe').should('be.visible');
      cy.contains('@janedoe').should('be.visible');
      cy.contains('@bobsmith').should('be.visible');
      cy.contains('@alice').should('be.visible');
    });

    it('should show loading state while fetching users', () => {
      cy.intercept('GET', 'https://challenge.surfe.com/users', {
        delay: 1000,
        statusCode: 200,
        body: mockUsers,
      }).as('getUsersDelayed');

      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.contains('Loading users...').should('be.visible');
      cy.wait('@getUsersDelayed');
      cy.get('[data-cy="mention-dropdown"]').should('be.visible');
    });
  });

  describe('2. Typing @ After Content', () => {
    it('should open dropdown when typing @ after a space', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('Hello ');
      cy.get('[data-cy="mention-editor-input"]').type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-dropdown"]').should('be.visible');
    });

    it('should NOT open dropdown when typing @ after a word (no space)', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('hello@');
      cy.get('[data-cy="mention-dropdown"]').should('not.exist');
    });

    it('should open dropdown after newline', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('First line{enter}');
      cy.get('[data-cy="mention-editor-input"]').type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-dropdown"]').should('be.visible');
    });
  });

  describe('3. Typing @ When Dropdown Already Open', () => {
    it('should close dropdown when typing @ again', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-dropdown"]').should('be.visible');
      cy.get('[data-cy="mention-editor-input"]').type('@');
      cy.get('[data-cy="mention-dropdown"]').should('not.exist');
    });
  });

  describe('4. Query Filtering', () => {
    it('should filter users by username', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@alice');
      cy.wait('@getUsers');
      cy.contains('@alicedoe').should('be.visible');
    });

    it('should filter users by first name', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@jane');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-option"]').should('have.length', 1);
      cy.contains('@janedoe').should('be.visible');
    });

    it('should filter users by last name', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@smith');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-option"]').should('have.length', 1);
      cy.contains('@bobsmith').should('be.visible');
    });

    it('should be case-insensitive', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@JOHN');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-option"]').should('have.length.at.least', 1);
      cy.contains('@johndoe').should('be.visible');
    });

    it('should show "No users found" when no matches', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@xyz123notfound');
      cy.wait('@getUsers');
      cy.contains('No users found').should('be.visible');
    });
  });

  describe('5. Adding Mentions', () => {
    it('should insert mention when clicking user', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@john');
      cy.wait('@getUsers');
      cy.contains('@johndoe').parent().click();
      cy.get('[data-cy="mention"]').should('contain', '@johndoe');
      cy.get('[data-cy="mention-dropdown"]').should('not.exist');
    });

    it('should insert mention when pressing Enter', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@john');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{enter}');
      cy.get('[data-cy="mention"]').should('contain', '@johndoe');
      cy.get('[data-cy="mention-dropdown"]').should('not.exist');
    });

    it('should add space after mention', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@john');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{enter}');
      cy.get('[data-cy="mention-editor-input"]').type('text after');
      cy.get('[data-cy="mention-editor-input"]').should('contain', 'text after');
    });

    it('should have proper mention styling', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@john');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{enter}');
      cy.get('[data-cy="mention"]')
        .should('have.class', 'bg-blue-100')
        .and('have.class', 'text-blue-700')
        .and('have.class', 'rounded');
    });

    it('should set mention as non-editable', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@john');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{enter}');
      cy.get('[data-cy="mention"]').should('have.attr', 'contenteditable', 'false');
    });

    it('should store username in data attribute', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@john');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{enter}');
      cy.get('[data-cy="mention"]').should('have.attr', 'data-username', 'johndoe');
    });

    it('should allow multiple mentions', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@john');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{enter}');
      cy.get('[data-cy="mention-editor-input"]').type(' and ');
      cy.get('[data-cy="mention-editor-input"]').type('@jane');
      cy.get('[data-cy="mention-editor-input"]').type('{enter}');
      cy.get('[data-cy="mention"]').should('have.length', 2);
    });

    it('should replace @ and query with mention', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@john');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{enter}');
      cy.get('[data-cy="mention"]').should('contain', '@johndoe');
    });
  });

  describe('6. Keyboard Navigation', () => {
    it('should highlight first user by default', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-option"]').first().should('have.class', 'bg-blue-100');
    });

    it('should move highlight down with ArrowDown', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{downarrow}');
      cy.get('[data-cy="mention-option"]').eq(1).should('have.class', 'bg-blue-100');
    });

    it('should move highlight up with ArrowUp', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{downarrow}{downarrow}');
      cy.get('[data-cy="mention-editor-input"]').type('{uparrow}');
      cy.get('[data-cy="mention-option"]').eq(1).should('have.class', 'bg-blue-100');
    });

    it('should not move highlight above first user', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{uparrow}');
      cy.get('[data-cy="mention-option"]').first().should('have.class', 'bg-blue-100');
    });

    it('should not move highlight below last user', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{downarrow}{downarrow}{downarrow}{downarrow}');
      cy.get('[data-cy="mention-option"]').last().should('have.class', 'bg-blue-100');
    });

    it('should insert highlighted user with Enter', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{downarrow}{enter}');
      cy.get('[data-cy="mention"]').should('contain', '@janedoe');
    });

    it('should close dropdown with Escape', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-dropdown"]').should('be.visible');
      cy.get('[data-cy="mention-editor-input"]').type('{esc}');
      cy.get('[data-cy="mention-dropdown"]').should('not.exist');
    });

    it('should reset highlighted index when query changes', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{downarrow}{downarrow}');
      cy.get('[data-cy="mention-option"]').eq(2).should('have.class', 'bg-blue-100');
      cy.get('[data-cy="mention-editor-input"]').type('j');
      cy.get('[data-cy="mention-option"]').first().should('have.class', 'bg-blue-100');
    });
  });

  describe('7. Deleting Mentions', () => {
    it('should delete entire mention with Backspace', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@john');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{enter}');
      cy.get('[data-cy="mention"]').should('exist');
      cy.get('[data-cy="mention-editor-input"]').type('{backspace}');
      cy.get('[data-cy="mention-editor-input"]').type('{backspace}');
      cy.get('[data-cy="mention"]').should('not.exist');
    });

    it('should preserve text after deleting mention', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@john');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{enter}');
      cy.get('[data-cy="mention-editor-input"]').type('some text');
      cy.get('[data-cy="mention-editor-input"]').type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{backspace}{backspace}');
      cy.get('[data-cy="mention"]').should('not.exist');
      cy.get('[data-cy="mention-editor-input"]').should('contain', 'some text');
    });
  });

  describe('8. Backspace in Dropdown', () => {
    it('should close dropdown when backspacing to just @', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@john');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-dropdown"]').should('be.visible');
      cy.get('[data-cy="mention-editor-input"]').type('{backspace}{backspace}{backspace}{backspace}{backspace}');
      cy.get('[data-cy="mention-dropdown"]').should('not.exist');
    });
  });

  describe('9. Click Outside Dropdown', () => {
    it('should close dropdown when clicking outside', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-dropdown"]').should('be.visible');
      cy.get('[data-cy="note-title-input"]').click();
      cy.get('[data-cy="mention-dropdown"]').should('not.exist');
    });
  });

  describe('10. API Error Handling', () => {
    it('should show error message when API fails', () => {
      cy.intercept('GET', 'https://challenge.surfe.com/users', {
        statusCode: 500,
        body: { error: 'Server error' },
      }).as('getUsersError');

      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsersError');
      cy.contains('Oops, users went for coffee').should('be.visible');
    });

    it('should show retry hint on error', () => {
      cy.intercept('GET', 'https://challenge.surfe.com/users', {
        statusCode: 500,
        body: { error: 'Server error' },
      }).as('getUsersError');

      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsersError');
      cy.contains('Try typing @ again').should('be.visible');
    });

    it('should allow retry by typing @ again', () => {
      cy.intercept('GET', 'https://challenge.surfe.com/users', {
        statusCode: 500,
        body: { error: 'Server error' },
      }).as('getUsersError');

      cy.get('[data-cy="mention-editor-input"]').focus().type('@');
      cy.wait('@getUsersError');
      cy.contains('Oops, users went for coffee').should('be.visible');

      cy.get('[data-cy="mention-editor-input"]').type('{esc}');

      cy.intercept('GET', 'https://challenge.surfe.com/users', {
        statusCode: 200,
        body: mockUsers,
      }).as('getUsersSuccess');

      cy.get('[data-cy="mention-editor-input"]').type(' @');
      cy.wait('@getUsersSuccess');
      cy.get('[data-cy="mention-dropdown"]').should('be.visible');
    });
  });

  describe('11. Mention Persistence', () => {
    it('should save mentions when note is saved', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('Hello @john');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{enter}');
      cy.get('[data-cy="mention-editor-input"]').type(' how are you?');

      cy.contains('button', 'Save').click();
      cy.wait('@createNote').its('request.body.body').then((body) => {
        const note = JSON.parse(body);
        expect(note.text).to.include('@johndoe');
        expect(note.text).to.include('data-username');
      });
    });
  });

  describe('12. Edge Cases', () => {
    it('should handle rapid @ typing', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@@@');
      cy.get('[data-cy="mention-dropdown"]').should('not.exist');
    });

    it('should handle @ at end of existing text', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('text');
      cy.get('[data-cy="mention-editor-input"]').type(' @');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-dropdown"]').should('be.visible');
    });

    it('should handle mention followed immediately by text', () => {
      cy.get('[data-cy="mention-editor-input"]').focus().type('@john');
      cy.wait('@getUsers');
      cy.get('[data-cy="mention-editor-input"]').type('{enter}');
      cy.get('[data-cy="mention-editor-input"]').type('text');
      cy.get('[data-cy="mention-editor-input"]').should('contain', 'text');
      cy.get('[data-cy="mention"]').should('exist');
    });
  });
});
