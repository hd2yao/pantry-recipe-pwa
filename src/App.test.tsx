import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('显示食材管家标题', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '食材管家' })).toBeInTheDocument();
  });
});
