import React from 'react';
import 'antd/dist/antd.css';
import './App.css';

import { Row, Col, Checkbox , Typography,
   Divider, Button, Space,Alert } from 'antd';

import { Steps } from 'antd';

const { Step } = Steps;
const { Title, Paragraph, Text, Link } = Typography;


function App() {
  return (
    <div style={{paddingTop: "5%"}}> 
      <Row>
        <Col span={12} offset={6} className="card">
          <Space direction="vertical">
              <Title>Load or generate Encryption-Key</Title>
              <Alert
                message="Encryption-Key"
                description="To encrypt and decrypt the data, or to make a new allowd timeslot, you will need an encryption key.
                You can load your existing one through QR or generate a new one."
                type="info"
                showIcon
              />
              <Space>
                <Button>Create new</Button>
                <Button type="primary">Load Existing</Button>
              </Space>

              <Divider/>
              
              <Title>Create a new timeslot</Title>
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default App;
