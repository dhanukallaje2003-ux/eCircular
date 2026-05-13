import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import "./Compose.css";

const Compose = () => {

  const navigate = useNavigate();

  const { quill, quillRef } = useQuill({
    theme: "snow"
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    documentType: "",
    priority: "",
    targetGroup: "",
    file: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const documentTypes = ["Circular", "Memorandum", "Policy"];

  const targetGroups = [
    "All Employees",
    "Department Heads",
    "Managers",
    "Specific Department",
    "Contractors"
  ];

  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        setFormData((prev) => ({
          ...prev,
          description: quill.root.innerHTML
        }));
      });
    }
  }, [quill]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file: file });
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, file: null });
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      alert('Please enter a topic first!');
      return;
    }

    setAiLoading(true);

    try {
      const GEMINI_API_KEY = 'AIzaSyBUdqKxqjKxZHtAtwjtXmfU2wjPqKG6zEk';
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert at writing professional organizational circulars.

Generate a professional circular for the following topic: "${aiTopic}"
Document Type: ${formData.documentType || 'Circular'}

Respond in this EXACT JSON format only, no other text, no markdown:
{
  "title": "Professional title here",
  "description": "Full professional circular content here in HTML format with proper paragraphs using <p> tags"
}`
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      console.log('Gemini response:', data);

      if (!data.candidates || !data.candidates[0]) {
        alert('AI generation failed. Check console for details.');
        return;
      }

      const text = data.candidates[0].content.parts[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      setFormData(prev => ({
        ...prev,
        title: parsed.title,
        description: parsed.description
      }));

      if (quill) {
        quill.root.innerHTML = parsed.description;
      }

      alert('✅ AI generated content successfully!');

    } catch (error) {
      console.error('AI Error:', error);
      alert('AI generation failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('documentType', formData.documentType);
      submitData.append('priority', formData.priority);
      submitData.append('targetGroup', formData.targetGroup);
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/circular/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData,
      });

      if (!response.ok) {
        alert("Failed to create circular");
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert("Circular created successfully!");
        navigate('/dashboard');
      } else {
        alert("Failed to create circular");
      }
    } catch (err) {
      alert("Failed to create circular. Make sure backend is running on port 5000");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="compose-page">

      <div className="compose-header">
        <h1>Create New Circular</h1>
        <p>Fill in the details below to publish a new circular on eCircular.</p>
      </div>

      <form onSubmit={handleSubmit} className="compose-form">

        {/* TITLE */}
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            placeholder="Enter circular title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* DOCUMENT TYPE + PRIORITY */}
        <div className="form-row">
          <div className="form-group">
            <label>Document Type *</label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              required
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority *</label>
            <select
  name="priority"
  value={formData.priority}
  onChange={handleChange}
>
  <option value="">Select priority</option>
  <option value="High">High</option>
</select>
           
          </div>
        </div>

        {/* AI GENERATE SECTION */}
        <div className="form-group">
          <label>✨ Generate with AI</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Type a topic... e.g. Office timing change from 9AM to 10AM"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '2px solid #4361ee',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={aiLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: aiLoading ? '#a0aec0' : '#4361ee',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: aiLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              {aiLoading ? '⏳ Generating...' : '✨ Generate'}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#718096', marginTop: '6px' }}>
            Type a topic and AI will automatically fill the title and description!
          </p>
        </div>

        {/* DESCRIPTION */}
        <div className="form-group">
          <label>Description *</label>
          <div ref={quillRef} className="editor-box" />
        </div>

        {/* TARGET GROUP */}
        <div className="form-group">
          <label>Target Group *</label>
          <select
            name="targetGroup"
            value={formData.targetGroup}
            onChange={handleChange}
            required
          >
            <option value="">Select target group</option>
            {targetGroups.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        {/* FILE UPLOAD */}
        <div className="form-group">
          <label>Upload Document</label>
          {formData.file ? (
            <div className="file-preview">
              <span>{formData.file.name}</span>
              <button type="button" onClick={removeFile}>Remove</button>
            </div>
          ) : (
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            />
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="publish-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish Circular"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Compose;