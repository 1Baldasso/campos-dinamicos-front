/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Flex, Form, Input, Select, Table } from "antd";
import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";

enum CampoTipo {
  Text,
  Mask,
  Select,
  MultiSelect,
  Upload,
  Number,
  MultiInput,
  Checkbox,
  Radio,
}

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [campos, setCampos] = useState([]);
  const [tableData, setTableData] = useState([{}]);
  const [tableColumns, setTableColumns] = useState([]);
  const [id, setId] = useState<string>("964BDC8E-C1D6-4741-BF73-3E400CF71852");
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    console.log(form.getFieldsValue());
    const jsonString = JSON.stringify(form.getFieldsValue());
    const finalData = {
      fixo: "Teste",
      dinamico: jsonString,
    };

    const response = await axios.post(
      `https://localhost:7089/camposdinamicos/`,
      finalData
    );
    const id = response.data;
    setId(id);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `https://localhost:7089/camposdinamicos/data/${id}`
      );
      const json = await response.data;
      const keys = [
        {
          title: "Fixo",
          dataIndex: "fixo",
        },
      ];
      const dinamico = JSON.parse(json.data.dinamico);
      for (const item of json.campos) {
        if (!dinamico[item.name] || dinamico[item.name] === "") {
          dinamico[item.name] = "Não informado";
        }
        if (dinamico[item.name] === true || dinamico[item.name] === false) {
          dinamico[item.name] = dinamico[item.name] ? "Sim" : "Não";
        }
        keys.push({
          title: item.label,
          dataIndex: item.name,
        });
      }
      setData(json);
      setTableData([
        {
          id: json.id,
          fixo: json.data.fixo,
          ...dinamico,
        },
      ]);
      //@ts-expect-error tableColumns
      setTableColumns(keys);
    };
    const fetchCampos = async () => {
      const response = await axios.get(
        `https://localhost:7089/camposdinamicos`
      );
      const json = await response.data;
      setCampos(json);
      setLoading(false);
    };

    fetchCampos().then(fetchData);
  }, [id]);

  return (
    !loading &&
    campos &&
    campos.length > 0 && (
      <Flex vertical gap="large" wrap style={{ width: "80%" }}>
        <Form form={form}>
          {campos.map((campo: any) => (
            <Form.Item
              key={campo.id}
              name={campo.name}
              label={campo.label}
              required={campo.required}
              valuePropName={
                campo.type === CampoTipo.Checkbox ? "checked" : "value"
              }
            >
              {campo.type === CampoTipo.Text ? (
                <Input type="text" />
              ) : campo.type === CampoTipo.Mask ? (
                <Input type="text" />
              ) : campo.type === CampoTipo.Select ? (
                <Select options={JSON.parse(campo.extraData)} />
              ) : campo.type === CampoTipo.Checkbox ? (
                <Input type="checkbox" />
              ) : campo.type === CampoTipo.Radio ? (
                <Input type="radio" />
              ) : campo.type === CampoTipo.Number ? (
                <Input type="number" />
              ) : campo.type === CampoTipo.Upload ? (
                <Input type="file" />
              ) : null}
            </Form.Item>
          ))}
          <Button type="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Form>
        {data && (
          <>
            <Table dataSource={tableData} columns={tableColumns} />
          </>
        )}
      </Flex>
    )
  );
};

export default App;
