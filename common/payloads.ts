import { getRandomString } from './helpers';

export function createAsset(name: string, realm: string) {
  return {
    id: '666fe026-2985-4cb3-80b8-ca080c8f9947',
    realm,
    name,
    owner: 'e5da3cf2-242a-11e8-b467-0ed5f89f718b',
    schema: {
      name: 'asset',
      type: 'record',
      fields: [
        { type: 'string', name: 'name' },
        { name: 'active', type: 'boolean' },
      ],
      namespace: 'io.ai',
    },
    'state-machine': {
      states: [
        { id: 'Event_1xtuh2c', name: '111', 'entrance-actions': [], 'exit-actions': [] },
        { id: 'Activity_0ahtmxc', name: '333', 'entrance-actions': [], 'exit-actions': [] },
        { id: 'Activity_1579xn9', name: '222', 'entrance-actions': [], 'exit-actions': [] },
        { id: 'Event_0kmkmqv', name: '444', 'entrance-actions': [], 'exit-actions': [] },
      ],
      transitions: [
        { id: getRandomString(8), name: '', from: 'Event_1xtuh2c', to: 'Activity_1579xn9', weight: 0.0, guards: [] },
        { id: getRandomString(8), name: '', from: 'Activity_1579xn9', to: 'Activity_0ahtmxc', weight: 0.0, guards: [] },
        { id: getRandomString(8), name: '', from: 'Activity_0ahtmxc', to: 'Event_0kmkmqv', weight: 0.0, guards: [] },
      ],
      'start-state': 'Event_1xtuh2c',
    },
    properties: {
      bpmnjs: '<xml />',
    },
  };
}

export default { createAsset };
