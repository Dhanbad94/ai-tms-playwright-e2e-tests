import { getRandomString } from './helpers';

/**
 * @param {String} name -
 * @param {String} realm -
 * @returns {JSON} - asset body
 */
export function createAsset(name, realm) {
  return {
    id: '666fe026-2985-4cb3-80b8-ca080c8f9947',
    realm,
    name,
    owner: 'e5da3cf2-242a-11e8-b467-0ed5f89f718b',
    schema: {
      name: 'asset',
      type: 'record',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
        {
          name: 'active',
          type: 'boolean',
        },
      ],
      namespace: 'io.ai',
    },
    'state-machine': {
      states: [
        {
          id: 'Event_1xtuh2c',
          name: '111',
          'entrance-actions': [],
          'exit-actions': [],
        },
        {
          id: 'Activity_0ahtmxc',
          name: '333',
          'entrance-actions': [],
          'exit-actions': [],
        },
        {
          id: 'Activity_1579xn9',
          name: '222',
          'entrance-actions': [],
          'exit-actions': [],
        },
        {
          id: 'Event_0kmkmqv',
          name: '444',
          'entrance-actions': [],
          'exit-actions': [],
        },
      ],
      transitions: [
        {
          id: '581474e1-184c-45ea-badf-8cf627d04a1c',
          name: '',
          from: 'Event_1xtuh2c',
          to: 'Activity_1579xn9',
          weight: 0.0,
          guards: [],
        },
        {
          id: '29092765-d9d9-4bea-9f4c-bf6eaf887cb5',
          name: '',
          from: 'Activity_1579xn9',
          to: 'Activity_0ahtmxc',
          weight: 0.0,
          guards: [],
        },
        {
          id: 'ddbdca55-ad94-4a47-a532-22f7200f8592',
          name: '',
          from: 'Activity_0ahtmxc',
          to: 'Event_0kmkmqv',
          weight: 0.0,
          guards: [],
        },
      ],
      'start-state': 'Event_1xtuh2c',
    },
    properties: {
      bpmnjs:
        '<?xml version="1.0" encoding="UTF-8"?>\n<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" targetNamespace="" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL http://www.omg.org/spec/BPMN/2.0/20100501/BPMN20.xsd">\n  <collaboration id="sid-c0e745ff-361e-4afb-8c8d-2a1fc32b1424">\n    <participant id="sid-87F4C1D6-25E1-4A45-9DA7-AD945993D06F" name="Asset" processRef="sid-C3803939-0872-457F-8336-EAE484DC4A04" />\n  </collaboration>\n  <process id="sid-C3803939-0872-457F-8336-EAE484DC4A04">\n    <extensionElements />\n    <startEvent id="Event_1xtuh2c" name="111">\n      <outgoing>Flow_0az6t5r</outgoing>\n    </startEvent>\n    <endEvent id="Event_0kmkmqv" name="444">\n      <incoming>Flow_0y438x7</incoming>\n    </endEvent>\n    <task id="Activity_0ahtmxc" name="333">\n      <incoming>Flow_04qq4t5</incoming>\n      <outgoing>Flow_0y438x7</outgoing>\n    </task>\n    <task id="Activity_1579xn9" name="222">\n      <incoming>Flow_0az6t5r</incoming>\n      <outgoing>Flow_04qq4t5</outgoing>\n    </task>\n    <sequenceFlow id="Flow_0az6t5r" sourceRef="Event_1xtuh2c" targetRef="Activity_1579xn9" />\n    <sequenceFlow id="Flow_04qq4t5" sourceRef="Activity_1579xn9" targetRef="Activity_0ahtmxc" />\n    <sequenceFlow id="Flow_0y438x7" sourceRef="Activity_0ahtmxc" targetRef="Event_0kmkmqv" />\n  </process>\n  <bpmndi:BPMNDiagram id="sid-74620812-92c4-44e5-949c-aa47393d3830">\n    <bpmndi:BPMNPlane id="sid-cdcae759-2af7-4a6d-bd02-53f3352a731d" bpmnElement="sid-c0e745ff-361e-4afb-8c8d-2a1fc32b1424">\n      <bpmndi:BPMNShape id="sid-87F4C1D6-25E1-4A45-9DA7-AD945993D06F_gui" bpmnElement="sid-87F4C1D6-25E1-4A45-9DA7-AD945993D06F" isHorizontal="true">\n        <omgdc:Bounds x="100" y="35" width="600" height="300" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNEdge id="Flow_0az6t5r_di" bpmnElement="Flow_0az6t5r">\n        <omgdi:waypoint x="188" y="70" />\n        <omgdi:waypoint x="224" y="70" />\n        <omgdi:waypoint x="224" y="240" />\n        <omgdi:waypoint x="260" y="240" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id="Flow_04qq4t5_di" bpmnElement="Flow_04qq4t5">\n        <omgdi:waypoint x="360" y="240" />\n        <omgdi:waypoint x="370" y="240" />\n        <omgdi:waypoint x="370" y="90" />\n        <omgdi:waypoint x="380" y="90" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id="Flow_0y438x7_di" bpmnElement="Flow_0y438x7">\n        <omgdi:waypoint x="480" y="90" />\n        <omgdi:waypoint x="551" y="90" />\n        <omgdi:waypoint x="551" y="250" />\n        <omgdi:waypoint x="622" y="250" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNShape id="Event_1xtuh2c_di" bpmnElement="Event_1xtuh2c">\n        <omgdc:Bounds x="152" y="52" width="36" height="36" />\n        <bpmndi:BPMNLabel>\n          <omgdc:Bounds x="162" y="95" width="17" height="14" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id="Event_0kmkmqv_di" bpmnElement="Event_0kmkmqv">\n        <omgdc:Bounds x="622" y="232" width="36" height="36" />\n        <bpmndi:BPMNLabel>\n          <omgdc:Bounds x="631" y="275" width="19" height="14" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id="Activity_0ahtmxc_di" bpmnElement="Activity_0ahtmxc">\n        <omgdc:Bounds x="380" y="50" width="100" height="80" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id="Activity_1579xn9_di" bpmnElement="Activity_1579xn9">\n        <omgdc:Bounds x="260" y="200" width="100" height="80" />\n      </bpmndi:BPMNShape>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</definitions>\n',
    },
  };
}
