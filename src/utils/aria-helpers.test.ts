// src/utils/aria-helpers.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generateAriaId,
  announceToScreenReader,
  getIconButtonAria,
  getDropdownAria,
  getModalAria,
  getNotificationAria,
  getFieldErrorAria,
  getTabsAria,
  getBadgeAria,
  getNavItemAria,
  getLoadingButtonAria,
} from './aria-helpers';

describe('aria-helpers', () => {
  describe('generateAriaId', () => {
    it('should generate ID with prefix', () => {
      const id = generateAriaId('test');
      expect(id).toContain('test-');
    });

    it('should generate unique IDs', () => {
      const id1 = generateAriaId('btn');
      const id2 = generateAriaId('btn');
      expect(id1).not.toBe(id2);
    });
  });

  describe('announceToScreenReader', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should create announcer element', () => {
      announceToScreenReader('Test message');
      const announcer = document.querySelector('[role="status"]');
      expect(announcer).toBeTruthy();
      expect(announcer?.textContent).toBe('Test message');
    });

    it('should use polite by default', () => {
      announceToScreenReader('Test');
      const announcer = document.querySelector('[aria-live]');
      expect(announcer?.getAttribute('aria-live')).toBe('polite');
    });

    it('should use assertive when specified', () => {
      announceToScreenReader('Error!', 'assertive');
      const announcer = document.querySelector('[aria-live]');
      expect(announcer?.getAttribute('aria-live')).toBe('assertive');
    });
  });

  describe('getIconButtonAria', () => {
    it('should return aria-label', () => {
      const attrs = getIconButtonAria('Close');
      expect(attrs['aria-label']).toBe('Close');
    });

    it('should include aria-expanded when provided', () => {
      const attrs = getIconButtonAria('Menu', true);
      expect(attrs['aria-expanded']).toBe(true);
    });

    it('should not include aria-expanded when undefined', () => {
      const attrs = getIconButtonAria('Menu');
      expect(attrs['aria-expanded']).toBeUndefined();
    });
  });

  describe('getDropdownAria', () => {
    it('should return button and menu attributes', () => {
      const attrs = getDropdownAria('menu-1', 'Options', true);
      expect(attrs.button['aria-label']).toBe('Options');
      expect(attrs.button['aria-expanded']).toBe(true);
      expect(attrs.button['aria-controls']).toBe('menu-1');
      expect(attrs.menu.id).toBe('menu-1');
    });

    it('should set aria-haspopup to true', () => {
      const attrs = getDropdownAria('menu-1', 'Options', false);
      expect(attrs.button['aria-haspopup']).toBe('true');
    });
  });

  describe('getModalAria', () => {
    it('should return modal attributes', () => {
      const attrs = getModalAria('title-1');
      expect(attrs.role).toBe('dialog');
      expect(attrs['aria-modal']).toBe(true);
      expect(attrs['aria-labelledby']).toBe('title-1');
    });

    it('should include describedby when provided', () => {
      const attrs = getModalAria('title-1', 'desc-1');
      expect(attrs['aria-describedby']).toBe('desc-1');
    });
  });

  describe('getNotificationAria', () => {
    it('should use assertive for errors', () => {
      const attrs = getNotificationAria('error');
      expect(attrs['aria-live']).toBe('assertive');
    });

    it('should use polite for success', () => {
      const attrs = getNotificationAria('success');
      expect(attrs['aria-live']).toBe('polite');
    });

    it('should set aria-atomic to true', () => {
      const attrs = getNotificationAria('info');
      expect(attrs['aria-atomic']).toBe(true);
    });
  });

  describe('getFieldErrorAria', () => {
    it('should mark field as invalid when has error', () => {
      const attrs = getFieldErrorAria('field-1', 'error-1', true);
      expect(attrs.field['aria-invalid']).toBe(true);
      expect(attrs.field['aria-describedby']).toBe('error-1');
    });

    it('should not mark field as invalid when no error', () => {
      const attrs = getFieldErrorAria('field-1', 'error-1', false);
      expect(attrs.field['aria-invalid']).toBe(false);
      expect(attrs.field['aria-describedby']).toBeUndefined();
    });

    it('should return error attributes', () => {
      const attrs = getFieldErrorAria('field-1', 'error-1', true);
      expect(attrs.error.id).toBe('error-1');
      expect(attrs.error.role).toBe('alert');
    });
  });

  describe('getTabsAria', () => {
    it('should return tab and panel attributes', () => {
      const attrs = getTabsAria('tab-1', 'panel-1', true);
      expect(attrs.tab.id).toBe('tab-1');
      expect(attrs.tab['aria-selected']).toBe(true);
      expect(attrs.tab['aria-controls']).toBe('panel-1');
      expect(attrs.panel.id).toBe('panel-1');
      expect(attrs.panel['aria-labelledby']).toBe('tab-1');
    });

    it('should set tabIndex to 0 for selected tab', () => {
      const attrs = getTabsAria('tab-1', 'panel-1', true);
      expect(attrs.tab.tabIndex).toBe(0);
    });

    it('should set tabIndex to -1 for unselected tab', () => {
      const attrs = getTabsAria('tab-1', 'panel-1', false);
      expect(attrs.tab.tabIndex).toBe(-1);
    });
  });

  describe('getBadgeAria', () => {
    it('should return badge attributes with count', () => {
      const attrs = getBadgeAria(5, 'notifications');
      expect(attrs['aria-label']).toBe('5 notifications');
      expect(attrs.role).toBe('status');
    });

    it('should handle zero count', () => {
      const attrs = getBadgeAria(0, 'messages');
      expect(attrs['aria-label']).toBe('0 messages');
    });
  });

  describe('getNavItemAria', () => {
    it('should mark current page', () => {
      const attrs = getNavItemAria('Home', true);
      expect(attrs['aria-label']).toBe('Home');
      expect(attrs['aria-current']).toBe('page');
    });

    it('should not mark non-current page', () => {
      const attrs = getNavItemAria('About', false);
      expect(attrs['aria-label']).toBe('About');
      expect(attrs['aria-current']).toBeUndefined();
    });
  });

  describe('getLoadingButtonAria', () => {
    it('should indicate loading state', () => {
      const attrs = getLoadingButtonAria(true, 'Submit');
      expect(attrs['aria-label']).toContain('Chargement');
      expect(attrs['aria-busy']).toBe(true);
      expect(attrs.disabled).toBe(true);
    });

    it('should not indicate loading when false', () => {
      const attrs = getLoadingButtonAria(false, 'Submit');
      expect(attrs['aria-label']).toBe('Submit');
      expect(attrs['aria-busy']).toBe(false);
      expect(attrs.disabled).toBe(false);
    });
  });
});
