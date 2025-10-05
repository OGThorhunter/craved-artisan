import React from 'react';
import { MyType, TestGroup } from './test-types';

const TestComponent: React.FC = () => {
  const testData: MyType = { name: 'test' };
  const testGroup: TestGroup = { title: 'test', items: [testData] };
  
  return (
    <div>
      <h1>Test Component</h1>
      <p>Type: {testData.name}</p>
      <p>Group: {testGroup.title}</p>
    </div>
  );
};

export default TestComponent;
