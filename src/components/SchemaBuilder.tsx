import React from 'react';
import { Button, Input, Select, Space, Typography, Switch, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

type FieldType = 'string' | 'number' | 'nested' | 'objectId' | 'float' | 'boolean';

interface Field {
  id: string;
  keyName: string;
  type: FieldType;
  value?: string | number | boolean | Field[];
  enabled: boolean;
}

interface SchemaBuilderProps {
  onChange: (schema: object) => void;
  onSubmit: (schema: object) => void;
}

const defaultFieldValue = (type: FieldType): string | number | boolean | Field[] => {
  switch (type) {
    case 'string':
      return '';
    case 'number':
    case 'float':
      return 0;
    case 'boolean':
      return false;
    case 'nested':
      return [];
    case 'objectId':
      return '';
    default:
      return '';
  }
};

const SchemaBuilder: React.FC<SchemaBuilderProps> = ({ onChange, onSubmit }) => {
  const [fields, setFields] = React.useState<Field[]>([
    { id: crypto.randomUUID(), keyName: 'field1', type: 'string', value: '', enabled: true },
  ]);

  const buildSchema = (fields: Field[]): object => {
    const schema: any = {};
    fields.forEach(({ keyName, type, value, enabled }) => {
      if (!enabled) return;
      if (type === 'nested' && Array.isArray(value)) {
        schema[keyName] = buildSchema(value);
      } else {
        schema[keyName] = value;
      }
    });
    return schema;
  };

  React.useEffect(() => {
    onChange(buildSchema(fields));
  }, [fields, onChange]);

  const updateField = (id: string, key: keyof Field, value: any, parentId?: string) => {
    const update = (f: Field[]): Field[] => {
      return f.map((field) => {
        if (field.id === parentId && field.type === 'nested' && Array.isArray(field.value)) {
          return {
            ...field,
            value: (field.value as Field[]).map((nested) =>
              nested.id === id ? { ...nested, [key]: value } : nested
            ),
          };
        } else if (field.type === 'nested' && Array.isArray(field.value)) {
          return { ...field, value: update(field.value) };
        }
        return field.id === id ? { ...field, [key]: value } : field;
      });
    };

    if (!parentId) {
      setFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
    } else {
      setFields((prev) => update(prev));
    }
  };

  const addField = (parentId?: string) => {
    const newField: Field = {
      id: crypto.randomUUID(),
      keyName: 'newField',
      type: 'string',
      value: '',
      enabled: true,
    };

    const insert = (f: Field[]): Field[] => {
      return f.map((field) => {
        if (field.id === parentId && field.type === 'nested' && Array.isArray(field.value)) {
          return { ...field, value: [...field.value, newField] };
        } else if (field.type === 'nested' && Array.isArray(field.value)) {
          return { ...field, value: insert(field.value) };
        }
        return field;
      });
    };

    if (!parentId) {
      setFields((prev) => [...prev, newField]);
    } else {
      setFields((prev) => insert(prev));
    }
  };

  const deleteField = (id: string, parentId?: string) => {
    const remove = (f: Field[]): Field[] => {
      return f.map((field) => {
        if (field.id === parentId && field.type === 'nested' && Array.isArray(field.value)) {
          return { ...field, value: field.value.filter((v) => v.id !== id) };
        } else if (field.type === 'nested' && Array.isArray(field.value)) {
          return { ...field, value: remove(field.value) };
        }
        return field;
      });
    };

    if (!parentId) {
      setFields((prev) => prev.filter((f) => f.id !== id));
    } else {
      setFields((prev) => remove(prev));
    }
  };

  const renderFields = (fields: Field[], parentId?: string): React.ReactNode =>
    fields.map((field) => (
      <div
        key={field.id}
        style={{
          marginBottom: 8,
          borderLeft: parentId ? '2px solid #ccc' : undefined,
          paddingLeft: parentId ? 16 : 0,
          maxWidth: '100%',
          overflowX: 'auto',
        }}
      >
        <Space
          style={{ display: 'flex', marginBottom: 8, flexWrap: 'wrap' }}
          align="start"
        >
          <Input
            placeholder="Field Name"
            value={field.keyName}
            onChange={(e) =>
              updateField(field.id, 'keyName', e.target.value, parentId)
            }
            style={{ width: 150 }}
          />
          <Select
            value={field.type}
            onChange={(value: FieldType) => {
              updateField(field.id, 'type', value, parentId);
              updateField(field.id, 'value', defaultFieldValue(value), parentId);
            }}
            style={{ width: 140 }}
            options={[
              { label: 'String', value: 'string' },
              { label: 'Number', value: 'number' },
              { label: 'Float', value: 'float' },
              { label: 'Boolean', value: 'boolean' },
              { label: 'ObjectId', value: 'objectId' },
              { label: 'Nested', value: 'nested' },
            ]}
          />
          {field.type !== 'nested' &&
            (field.type === 'boolean' ? (
              <Switch
                checked={field.value as boolean}
                onChange={(checked) =>
                  updateField(field.id, 'value', checked, parentId)
                }
              />
            ) : (
              <Input
                placeholder="Value"
                value={field.value as string | number}
                onChange={(e) => {
                  const val =
                    field.type === 'number' || field.type === 'float'
                      ? Number(e.target.value)
                      : e.target.value;
                  updateField(field.id, 'value', val, parentId);
                }}
                style={{ width: 150 }}
              />
            ))}
          <Switch
            checked={field.enabled}
            onChange={(checked) =>
              updateField(field.id, 'enabled', checked, parentId)
            }
            title="Enable/Disable Field"
          />
          <Button
            type="dashed"
            onClick={() => addField(field.id)}
            disabled={field.type !== 'nested'}
            icon={<PlusOutlined />}
          >
            Add Item
          </Button>
          <Button
            type="dashed"
            danger
            onClick={() => deleteField(field.id, parentId)}
            icon={<MinusCircleOutlined />}
          />
        </Space>
        {field.type === 'nested' && Array.isArray(field.value) && (
          <>
            {renderFields(field.value, field.id)}
            <Button
              type="dashed"
              onClick={() => addField(field.id)}
              icon={<PlusOutlined />}
              style={{ marginBottom: 8 }}
            >
              + Add Item
            </Button>
            <Divider />
          </>
        )}
      </div>
    ));

  return (
    <div>
      {renderFields(fields)}
      <Button
        type="dashed"
        onClick={() => addField()}
        icon={<PlusOutlined />}
        style={{ width: '100%', marginBottom: 16 }}
      >
         Add Item
      </Button>
      <Button
        type="primary"
        onClick={() => onSubmit(buildSchema(fields))}
        style={{ width: '100%' }}
      >
        Submit
      </Button>
    </div>
  );
};

export default SchemaBuilder;
