import React from 'react';
import { Layout, Typography, Row, Col } from 'antd';
import SchemaBuilder from './components/SchemaBuilder';

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [jsonSchema, setJsonSchema] = React.useState<object>({});

  const handleSubmit = (schema: object) => {
    console.log('Submitted schema:', schema);
    alert('Schema submitted! Check console for output.');
  };

  return (
    <Layout style={{ minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
     <Header
  style={{
    backgroundColor: '#264c70ff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  <Title style={{ color: 'white', margin: 0 }} level={3}>
    Json Schema Builder Task
  </Title>
</Header>

      <Content style={{ padding: '24px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <SchemaBuilder onChange={setJsonSchema} onSubmit={handleSubmit} />
          </Col>
          <Col span={12}>
            <pre style={{ backgroundColor: '#c7d4d3ff', padding: '16px', borderRadius: '4px', minHeight: '400px', overflow: 'auto' }}>
              {JSON.stringify(jsonSchema, null, 2)}
            </pre>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default App;

