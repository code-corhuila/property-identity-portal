/** The card of the auth screens (design-system.md): tokens only, no shared components. */
export const FORM_STYLES = `
  form, section {
    display: grid; gap: var(--space-2); margin: 0 auto; max-width: calc(8 * var(--space-16));
    padding: var(--space-8); background: var(--color-bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-md);
  }
  h1 { font-family: var(--font-family-serif); font-size: var(--font-size-2xl); margin: 0 0 var(--space-4); }
  label { font-size: var(--font-size-sm); }
  input { font: inherit; padding: var(--space-2); border-radius: var(--radius-md); }
  .field-error, [role='alert'] { color: var(--color-error); font-size: var(--font-size-sm); }
  button {
    margin-top: var(--space-4); padding: var(--space-3); border: none; cursor: pointer; border-radius: var(--radius-md);
    font: inherit; font-weight: var(--font-weight-medium); background: var(--color-primary-900); color: var(--color-text-on-dark);
  }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
`;
