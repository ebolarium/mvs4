// src/pages/Songs.js

import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Row, Col, Card, ListGroup, Modal } from 'react-bootstrap';
import { GlobalStateContext } from '../context/GlobalStateProvider';
import API_BASE_URL from '../config/apiConfig';
import { useTranslation } from 'react-i18next';
import './Songs.css'; // CSS dosyasını içe aktardık


const Songs = () => {
  const { t } = useTranslation();
  const [songs, setSongs] = useState([]);
  const [formData, setFormData] = useState({ title: '', artist: '', key: 'Tune' });
  const [editSong, setEditSong] = useState(null); // Düzenlenecek şarkı bilgisi
  const [showEditModal, setShowEditModal] = useState(false); // Modal kontrolü
  const { state, dispatch } = useContext(GlobalStateContext);
  const [isAscending, setIsAscending] = useState(true); // Varsayılan olarak A-Z
  const [searchQuery, setSearchQuery] = useState(''); // Arama kutusundaki değer



  const { title, artist, key } = formData;

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return alert(t('login_required'));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/songs`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setSongs(data.songs || []);
      dispatch({ type: 'SET_ALL_SONGS', payload: data.songs || [] });
    } catch (error) {
      console.error(t('error_fetching_songs'), error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (song) => {
    setEditSong(song);
    setFormData({ title: song.title, artist: song.artist, key: song.key || 'Tune', // Eğer key yoksa varsayılan olarak 'Tune'
    });
    setShowEditModal(true);
  };



  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert(t('login_required'));

    try {
      const response = await fetch(`${API_BASE_URL}/songs/update/${editSong._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedSongs = songs.map((song) =>
          song._id === editSong._id ? { ...song, ...formData } : song
        );
        setSongs(updatedSongs);
        setShowEditModal(false);
      } else {
        alert(t('error_updating_song'));
      }
    } catch (error) {
      console.error(t('error_updating_song'), error);
    }
  };

  const sortSongs = () => {
    const sortedSongs = [...songs].sort((a, b) => {
      if (isAscending) {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
  
    setSongs(sortedSongs); // Sıralanmış şarkıları güncelle
    setIsAscending(!isAscending); // Sıralama yönünü değiştir
  };


  const handleCloseEditModal = () => {
    setFormData({ title: '', artist: '', key: 'Tune' }); // Formu sıfırlama
    setShowEditModal(false); // Modal'ı kapatma
  };


  function levenshteinDistance(a = '', b = '') {
    const matrix = Array(a.length + 1).fill(null).map(() =>
      Array(b.length + 1).fill(null)
    );
  
    for (let i = 0; i <= a.length; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }
  
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,    // silme
          matrix[i][j - 1] + 1,    // ekleme
          matrix[i - 1][j - 1] + cost // değiştirme
        );
      }
    }
  
    return matrix[a.length][b.length];
  }



  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

  
    const token = localStorage.getItem('token');
    if (!token) {
      return alert(t('login_required'));
    }
  
    // Aynı veya benzer şarkı var mı kontrol et
    const existingSong = songs.find(song => 
      levenshteinDistance(song.title.toLowerCase(), formData.title.toLowerCase()) <= 2 &&
      levenshteinDistance(song.artist.toLowerCase(), formData.artist.toLowerCase()) <= 2
    );
  
    if (existingSong) {
      return alert(t('song_already_exists'));
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/songs/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        const data = await response.json();
        const updatedSongs = [...songs, data.song];
        setSongs(updatedSongs);
        setFormData({ title: '', artist: '', key: 'Tune' }); // Form sıfırlanırken key de resetlenir
  
        dispatch({ type: 'ADD_SONG', payload: data.song });
      } else {
        const errorData = await response.json();
        alert(`${t('error_adding_song')}: ${t(errorData.message)}`);
      }
    } catch (error) {
      console.error(t('error_adding_song'), error);
    }
  
    setLoading(false);
  };
  


  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return alert(t('login_required'));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/songs/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedSongs = songs.filter((song) => song._id !== id);
        setSongs(updatedSongs);

        // Update global state
        dispatch({
          type: 'SET_ALL_SONGS',
          payload: state.allSongs.filter((song) => song._id !== id),
        });
      } else {
        const errorData = await response.json();
        alert(`${t('error_deleting_song')}: ${t(errorData.message)}`);
      }
    } catch (error) {
      console.error(t('error_deleting_song'), error);
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col md={4}>
          <Card className="shadow">
            <Card.Body>
              <h2 className="text-center mb-4">{t('add_new_song')}</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formTitle">
                  <Form.Label>{t('song_title')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={title}
                    onChange={handleChange}
                    placeholder={t('enter_song_title')}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formArtist">
                  <Form.Label>{t('artist')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="artist"
                    value={artist}
                    onChange={handleChange}
                    placeholder={t('enter_artist_name')}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formKey">
  <Form.Label>{t('song_key')}</Form.Label>
  <Form.Select
    name="key"
    value={formData.key} // Formdaki key değerini kullanıyoruz
    onChange={handleChange}
  >
    {[
      'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
      'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm', 'Tune'
    ].map((tone) => (
      <option key={tone} value={tone}>
        {tone}
      </option>
    ))}
  </Form.Select>
</Form.Group>


                <Button variant="primary" type="submit" className="w-100">
                  {t('add_song')}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
  <Card className="shadow">
    <Card.Body>
    <div className="d-flex justify-content-between align-items-center mb-4">
  <h2 className="text-center">{t('song_repository')}</h2>
  <div className="search-container">
    <Button 
      variant="outline-secondary" 
      onClick={sortSongs}
    >
      {isAscending ? 'A-Z' : 'Z-A'}
    </Button>
    <input
      type="text"
      placeholder={t('search')}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
</div>
<ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
  {songs
    .filter((song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((song) => (
      <ListGroup.Item key={song._id} className="list-item-content">
        <div className="row w-100">
          <div className="col-8 d-flex align-items-center">
            <strong className="me-2">{song.title}</strong>
            <span className="me-2">{t('by')}</span>
            <span>{song.artist}</span>
          </div>
          <div className="col-4 d-flex justify-content-end align-items-center icon-container">
            <div className="d-flex align-items-center me-3">
              <span className="emoji">👍</span>
              <span className="count">{song.totalvotecount || 0}</span>
            </div>
            <div className="d-flex align-items-center me-3">
              <span className="emoji">▶</span>
              <span className="count">{song.playcount || 0}</span>
            </div>
            <button
              className="icon-button emoji-button"
              onClick={() => handleEdit(song)}
            >
              ✏️
            </button>
            <button
              className="icon-button emoji-button"
              onClick={() => handleDelete(song._id)}
            >
              🗑️
            </button>
          </div>
        </div>
      </ListGroup.Item>
    ))}
</ListGroup>    </Card.Body>
  </Card>
</Col>



      </Row>
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
      <Modal.Header closeButton>
          <Modal.Title>{t('edit_song')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>{t('song_title')}</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formArtist">
              <Form.Label>{t('artist')}</Form.Label>
              <Form.Control
                type="text"
                name="artist"
                value={artist}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formKey">
        <Form.Label>{t('song_key')}</Form.Label>
        <Form.Select
          name="key"
          value={key}
          onChange={handleChange}
        >
          {[
            'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
            'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm', 'Tune'
          ].map((tone) => (
            <option key={tone} value={tone}>
              {tone}
            </option>
          ))}
        </Form.Select>
      </Form.Group>


            <Button variant="primary" onClick={handleUpdate}>
              {t('save_changes')}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Songs;
