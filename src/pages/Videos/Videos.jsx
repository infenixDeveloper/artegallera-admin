import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@services/api";
import { getAllVideos } from "@redux/slice/videosSlice";
import {
  Box,
  Typography,
  LinearProgress,
  TextField,
  IconButton,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import AppButton from "@components/Button/Button";
import AppModal from "@components/Modal/Modal";
import Table from "@components/Table/Table";

import "./Videos.css";

const Videos = () => {
  const dispatch = useDispatch();
  const videos = useSelector((state) => state.videos.videos);

  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoName, setVideoName] = useState(""); // Estado para el nombre del video
  const [isEventVideo, setIsEventVideo] = useState(false); // Estado para el checkbox
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    dispatch(getAllVideos());
  }, [dispatch]);

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const handleUploadVideo = () => {
    if (!videoName.trim()) {
      alert("Por favor, ingresa un nombre para el video.");
      return;
    }

    const formData = new FormData();
    formData.append("video", video);
    formData.append("name", videoName.trim());
    formData.append("is_event_video", isEventVideo); // Añadir el valor del checkbox

    setLoading(true);

    api
      .post("/video/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      })
      .then((response) => {
        setLoading(false);
        setProgress(0);
        setModalOpen(false);
        dispatch(getAllVideos());
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteVideo = async (id) => {
    try {
      await api.delete(`/video/${id}`);
      dispatch(getAllVideos());
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      field: "name",
      header: "Nombre",
    },
    {
      field: "type",
      header: "Tipo",
    },
    {
      field: "status",
      header: "Estado",
    },
    {
      field: "actions",
      header: "Acciones",
      cell: (video) => (
        <IconButton
          aria-label="delete"
          onClick={() => {
            setDeleteModal(true);
            setSelectedVideo(video.actions);
          }}
        >
          <DeleteIcon sx={{ color: "white" }} />
        </IconButton>
      ),
    },
  ];

  useEffect(() => {
    const videosRows = Array.from(videos.promotions || []).map((v) => ({
      name: v.file,
      type: v.is_event_video ? "Presentación" : "Evento",
      status: v.status ? "Activo" : "Inactivo",
      actions: v,
    }));

    setRows(videosRows);
  }, [videos]);

  return (
    <div className="videos__container">
      <Typography variant="h4" color="white">
        Videos
      </Typography>

      <Table
        columns={columns}
        rows={rows}
        searcheable
        AddButton={
          <AppButton
            variant="gradient"
            onClick={() => setModalOpen(true)}
            sx={{
              width: { md: "200px", sm: "200px" },
              fontSize: {
                xs: ".7rem",
                sm: "1rem",
              },
            }}
          >
            agregar video
          </AppButton>
        }
      />

      <AppModal open={modalOpen} close={() => setModalOpen(false)}>
        <div className="other-view">
          <Typography variant="h5" mb={2} color="white" align="center">
            Agregar Video
          </Typography>
          <form>
            <TextField
              fullWidth
              variant="outlined"
              label="Nombre del Video"
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  color: "white", // Color del texto dentro del input
                  "& input": {
                    color: "white", // Color del texto al escribir
                  },
                  "& fieldset": {
                    borderColor: "white", // Color del borde normal
                  },
                  "&:hover fieldset": {
                    borderColor: "white", // Color del borde al pasar el mouse
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white", // Color del borde cuando está enfocado
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "white", // Color normal del label
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "white", // Color del label cuando está enfocado
                },
                "& .MuiInputLabel-root:hover": {
                  color: "white", // Color del label al pasar el mouse
                },
                color: "white",
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isEventVideo}
                  onChange={(e) => setIsEventVideo(e.target.checked)}
                  sx={{ color: "white" }}
                />
              }
              label="¿Es un video de presentación?"
              sx={{ color: "white", mb: 2 }}
            />
            <Button
              component="label"
              variant="contained"
              sx={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid grey",
                boxShadow: "none",
                width: "100%",
                mb: 1,
              }}
              startIcon={<CloudUploadIcon />}
            >
              Cargar Video
              <VisuallyHiddenInput
                type="file"
                onChange={handleFileChange}
                accept="video/*"
              />
            </Button>
            {videoPreview && (
              <div className="video-preview">
                <video
                  src={videoPreview}
                  controls
                  style={{ maxWidth: "100%", marginTop: "10px" }}
                ></video>
              </div>
            )}
            {loading && (
              <Box sx={{ width: "100%", mt: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="body2" color="textSecondary">
                  {progress}% Cargado
                </Typography>
              </Box>
            )}
            <AppButton
              sx={{ mt: 1 }}
              variant="gradient-square"
              onClick={handleUploadVideo}
              disabled={loading}
              startIcon={loading && <CloudUploadIcon />}
            >
              {loading ? "Cargando..." : "Subir Video"}
            </AppButton>
          </form>
        </div>
      </AppModal>

      <AppModal open={deleteModal} close={() => setDeleteModal(false)}>
        <Typography variant="h6" mb={2} color="white" align="center">
          ¿Estás seguro que deseas eliminar este video?
        </Typography>
        <Box display="flex" justifyContent="space-between" mt={2} gap={1}>
          <AppButton
            variant="gradient-square"
            onClick={() => {
              handleDeleteVideo(selectedVideo.id);
              setDeleteModal(false);
            }}
          >
            Eliminar
          </AppButton>
          <AppButton
            variant="gradient-square"
            onClick={() => setDeleteModal(false)}
          >
            Cancelar
          </AppButton>
        </Box>
      </AppModal>
    </div>
  );
};

export default Videos;
