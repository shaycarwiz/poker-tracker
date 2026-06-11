import {
  flattenHandActions,
  getBoardUpToStep,
  createEmptyFullHandState,
} from '../cards';

describe('cards utilities', () => {
  it('flattens hand actions across streets', () => {
    const state = createEmptyFullHandState();
    state.streets[0].actions = [
      { seat: 1, type: 'raise', amount: 8 },
      { seat: 2, type: 'call', amount: 8 },
    ];
    state.streets[1].board = ['Ah', 'Kd', '7c'];
    state.streets[1].actions = [{ seat: 2, type: 'check' }];

    const steps = flattenHandActions(state.streets);
    expect(steps).toHaveLength(3);
    expect(steps[2]).toEqual({ streetIndex: 1, actionIndex: 0 });
  });

  it('reveals board progressively during review', () => {
    const state = createEmptyFullHandState();
    state.streets[0].actions = [{ seat: 1, type: 'raise', amount: 8 }];
    state.streets[1].board = ['Ah', 'Kd', '7c'];
    state.streets[1].actions = [{ seat: 2, type: 'check' }];
    state.streets[2].board = ['Ah', 'Kd', '7c', '2s'];

    expect(getBoardUpToStep(state.streets, -1)).toEqual([]);
    expect(getBoardUpToStep(state.streets, 0)).toEqual([]);
    expect(getBoardUpToStep(state.streets, 1)).toEqual(['Ah', 'Kd', '7c']);
  });
});
