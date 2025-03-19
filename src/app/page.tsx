"use client";
import "@ant-design/v5-patch-for-react-19";

import { InboxOutlined, UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Input, message, Space, Typography, Upload, Spin, Timeline, Statistic, Row, Col } from "antd";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import CountUp from "react-countup";

const { Text, Title } = Typography;

export default function Home() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [processFinished, setProcessFinished] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [timelineItems, setTimelineItems] = useState([
    { label: "Selecionar arquivo", children: "Aguardando arquivo", color: "gray" }
  ]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const statisticsRef = useRef(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleFileChange = (info) => {
    const selectedFile = info.file;
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(selectedFile.size);
  };

  const checkProcessStatus = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/insert-status`);
      if (data.processFinished) {
        setProcessFinished(true);
        setUserCount(data.insertedCount);
        setEndTime(new Date());

        setTimelineItems((prevItems) => [
          ...prevItems,
          { label: "Processamento concluído", children: `${data.insertedCount} usuários inseridos.`, color: "green" }
        ]);

        message.success(`Arquivo processado com sucesso! ${data.insertedCount} usuários inseridos.`);

        setTimelineItems((prevItems) => prevItems.map(item => ({ ...item, color: "green" })));

        setIsProcessing(false);

        setTimeout(() => {
          setShowTimeline(false);
          setShowStatistics(true);
        }, 5000);
      }
    } catch (error) {
      console.error("Erro ao verificar status do processo", error);
      setTimelineItems((prevItems) => [
        ...prevItems,
        { label: "Erro no processamento", children: "Erro ao processar o arquivo", color: "red" }
      ]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statisticsRef.current && !statisticsRef.current.contains(event.target)) {
        setShowStatistics(false);
      }
    };

    if (showStatistics) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatistics]);

  useEffect(() => {
    if (!processFinished) {
      const interval = setInterval(() => {
        checkProcessStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [processFinished]);

  const handleUpload = async () => {
    if (!file) {
      message.error("Selecione um arquivo antes de enviar");
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);
    setShowTimeline(true);
    setStartTime(new Date());

    setTimelineItems([
      { label: "Selecionar arquivo", children: "Aguardando arquivo", color: "green" },
      { label: "Enviando arquivo", children: "O arquivo está sendo enviado...", color: "blue" }
    ]);

    try {
      const { data: preSignedUrl } = await axios.post(
        `${API_URL}/aws/s3/pre-signed-url`,
        { fileNameLocator: fileName }
      );

      await axios.put(preSignedUrl.replace(/^"|"$/g, ""), file, {
        headers: { "Content-Type": "application/octet-stream" },
      });

      setTimelineItems((prevItems) => [
        ...prevItems,
        { label: "Arquivo enviado", children: "O arquivo foi enviado com sucesso.", color: "blue" },
        { label: "Processando arquivo", children: "O arquivo está sendo processado...", color: "orange" }
      ]);

      message.success("Arquivo enviado com sucesso!");
    } catch (error) {
      message.error("Erro ao fazer upload: " + error.message);
      setTimelineItems((prevItems) => [
        ...prevItems,
        { label: "Erro no envio", children: `Erro: ${error.message}`, color: "red" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#0D0723", paddingTop: "50px" }}>
      <Title level={1} style={{ color: "white", fontSize: "36px" }}>
        Bem-vindo à tela de upload de usuários em massa 🔥
      </Title>

      <Space direction="vertical" size="large" style={{ width: "100%", maxWidth: "400px", zIndex: 1 }}>
        <Space.Compact style={{ width: "100%" }}>
          <Input prefix={<InboxOutlined style={{ color: "rgba(0,0,0,0.45)" }} />} placeholder="Selecione um arquivo" value={fileName} readOnly style={{ fontSize: "18px", height: "50px" }} />
          <Upload showUploadList={false} beforeUpload={() => false} onChange={handleFileChange}>
            <Button type="primary" icon={<UploadOutlined />} style={{ backgroundColor: "#18C78A", borderColor: "#18C78A", fontSize: "18px", height: "50px" }}>
              <Text style={{ color: "white", fontWeight: "bold" }}>Escolher</Text>
            </Button>
          </Upload>
        </Space.Compact>
        <Button type="primary" onClick={handleUpload} style={{ backgroundColor: "#18C78A", borderColor: "#18C78A", fontSize: "18px", height: "50px", width: "100%" }}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Enviar</Text>
        </Button>
      </Space>

      {showTimeline && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "white", padding: "20px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", zIndex: 2, borderRadius: "8px", width: "80%", maxWidth: "500px" }}>
          <Timeline mode="left">
            {timelineItems.map((item, index) => (
              <Timeline.Item key={index} color={item.color} dot={item.color === 'orange' ? <Spin indicator={<LoadingOutlined />} /> : null}>
                <Text strong>{item.label}</Text>
                <div>{item.children}</div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      )}

      {showStatistics && (
        <>
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1
          }} />
          <div
            ref={statisticsRef}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              zIndex: 3,
              width: "80%",
              maxWidth: "500px",
            }}
          >
            <Row gutter={16}>
              <Col span={12}><Statistic title="Arquivo" value={fileName} /></Col>
              <Col span={12}><Statistic title="Tamanho (KB)" value={(fileSize / 1024).toFixed(2)} /></Col>
              <Col span={12}><Statistic title="Início" value={startTime?.toLocaleTimeString()} /></Col>
              <Col span={12}><Statistic title="Fim" value={endTime?.toLocaleTimeString()} /></Col>
              <Col span={12}><Statistic title="Usuários inseridos" value={userCount} formatter={(value) => <CountUp end={Number(value)} separator="," />} /></Col>
            </Row>
          </div>
        </>
      )}
    </div>
  );
}
