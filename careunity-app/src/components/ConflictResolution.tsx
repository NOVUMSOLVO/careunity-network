import React, { useState, useEffect } from 'react';
import OfflineService from '../services/offline-service';

interface ConflictResolutionProps {
  conflictId: number;
  onResolved?: () => void;
}

const ConflictResolution: React.FC<ConflictResolutionProps> = ({ 
  conflictId, 
  onResolved 
}) => {
  const [conflict, setConflict] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<'client' | 'server' | 'manual'>('server');
  const [manualData, setManualData] = useState<any | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [diffView, setDiffView] = useState(true);

  // Load conflict data
  useEffect(() => {
    const loadConflict = async () => {
      try {
        setLoading(true);
        const conflicts = await OfflineService.getConflicts();
        const foundConflict = conflicts.find(c => c.id === conflictId);
        
        if (foundConflict) {
          setConflict(foundConflict);
          // Initialize manual data with server data as a starting point
          setManualData(JSON.parse(JSON.stringify(foundConflict.serverData)));
        } else {
          setError('Conflict not found');
        }
      } catch (err) {
        setError('Error loading conflict: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    loadConflict();
  }, [conflictId]);

  // Resolve the conflict
  const resolveConflict = async () => {
    if (!conflict) return;
    
    try {
      setIsResolving(true);
      const success = await OfflineService.resolveConflict(
        conflictId,
        resolution,
        resolution === 'manual' ? manualData : undefined
      );
      
      if (success) {
        if (onResolved) {
          onResolved();
        }
      } else {
        setError('Failed to resolve conflict');
      }
    } catch (err) {
      setError('Error resolving conflict: ' + (err.message || 'Unknown error'));
    } finally {
      setIsResolving(false);
    }
  };

  // Handle manual data changes
  const handleManualDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value);
      setManualData(parsed);
    } catch (err) {
      // Don't update if JSON is invalid
    }
  };

  // Render loading state
  if (loading) {
    return <div className="conflict-resolution loading">Loading conflict data...</div>;
  }

  // Render error state
  if (error) {
    return <div className="conflict-resolution error">{error}</div>;
  }

  // Render not found state
  if (!conflict) {
    return <div className="conflict-resolution not-found">Conflict not found</div>;
  }

  // Format JSON for display
  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  // Find differences between client and server data
  const findDifferences = () => {
    const clientData = conflict.clientData;
    const serverData = conflict.serverData;
    const differences: string[] = [];

    // Compare all keys in both objects
    const allKeys = new Set([
      ...Object.keys(clientData || {}),
      ...Object.keys(serverData || {})
    ]);

    allKeys.forEach(key => {
      const clientValue = clientData?.[key];
      const serverValue = serverData?.[key];

      if (JSON.stringify(clientValue) !== JSON.stringify(serverValue)) {
        differences.push(key);
      }
    });

    return differences;
  };

  const differences = findDifferences();

  return (
    <div className="conflict-resolution">
      <h2>Resolve Data Conflict</h2>
      
      <div className="conflict-info">
        <p>
          <strong>Entity Type:</strong> {conflict.entityType}
        </p>
        <p>
          <strong>Entity ID:</strong> {conflict.entityId}
        </p>
        <p>
          <strong>Client Version:</strong> {conflict.clientVersion}
        </p>
        <p>
          <strong>Server Version:</strong> {conflict.serverVersion}
        </p>
        <p>
          <strong>Timestamp:</strong> {new Date(conflict.timestamp).toLocaleString()}
        </p>
        <p>
          <strong>Differences:</strong> {differences.length} fields ({differences.join(', ')})
        </p>
      </div>

      <div className="view-controls">
        <label>
          <input
            type="checkbox"
            checked={diffView}
            onChange={() => setDiffView(!diffView)}
          />
          Show only differences
        </label>
      </div>
      
      <div className="resolution-options">
        <label>
          <input
            type="radio"
            name="resolution"
            value="server"
            checked={resolution === 'server'}
            onChange={() => setResolution('server')}
          />
          Use server version
        </label>
        
        <label>
          <input
            type="radio"
            name="resolution"
            value="client"
            checked={resolution === 'client'}
            onChange={() => setResolution('client')}
          />
          Use client version
        </label>
        
        <label>
          <input
            type="radio"
            name="resolution"
            value="manual"
            checked={resolution === 'manual'}
            onChange={() => setResolution('manual')}
          />
          Manual resolution
        </label>
      </div>
      
      <div className="data-comparison">
        <div className="data-column">
          <h3>Server Data</h3>
          <pre className="data-display server-data">
            {diffView
              ? differences.map(key => (
                  <div key={key} className="diff-item">
                    <span className="diff-key">{key}:</span>
                    <span className="diff-value">{JSON.stringify(conflict.serverData[key], null, 2)}</span>
                  </div>
                ))
              : formatJson(conflict.serverData)}
          </pre>
        </div>
        
        <div className="data-column">
          <h3>Client Data</h3>
          <pre className="data-display client-data">
            {diffView
              ? differences.map(key => (
                  <div key={key} className="diff-item">
                    <span className="diff-key">{key}:</span>
                    <span className="diff-value">{JSON.stringify(conflict.clientData[key], null, 2)}</span>
                  </div>
                ))
              : formatJson(conflict.clientData)}
          </pre>
        </div>
      </div>
      
      {resolution === 'manual' && (
        <div className="manual-resolution">
          <h3>Manual Resolution</h3>
          <p>Edit the JSON below to resolve the conflict manually:</p>
          <textarea
            value={formatJson(manualData)}
            onChange={handleManualDataChange}
            rows={10}
            className="manual-editor"
          />
        </div>
      )}
      
      <div className="actions">
        <button
          onClick={resolveConflict}
          disabled={isResolving}
          className="resolve-button"
        >
          {isResolving ? 'Resolving...' : 'Resolve Conflict'}
        </button>
        
        <button
          onClick={() => window.history.back()}
          className="cancel-button"
        >
          Cancel
        </button>
      </div>

      <style jsx>{`
        .conflict-resolution {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        h2 {
          margin-bottom: 20px;
          color: #333;
        }
        
        .conflict-info {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .conflict-info p {
          margin: 5px 0;
        }
        
        .view-controls {
          margin-bottom: 15px;
        }
        
        .resolution-options {
          display: flex;
          margin-bottom: 20px;
        }
        
        .resolution-options label {
          margin-right: 20px;
          display: flex;
          align-items: center;
        }
        
        .resolution-options input {
          margin-right: 5px;
        }
        
        .data-comparison {
          display: flex;
          margin-bottom: 20px;
          gap: 20px;
        }
        
        .data-column {
          flex: 1;
        }
        
        .data-display {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 10px;
          overflow: auto;
          max-height: 300px;
          font-family: monospace;
          white-space: pre-wrap;
          word-break: break-all;
        }
        
        .server-data {
          background-color: #e8f4f8;
        }
        
        .client-data {
          background-color: #f8f0e8;
        }
        
        .diff-item {
          padding: 5px 0;
          border-bottom: 1px solid #dee2e6;
        }
        
        .diff-key {
          font-weight: bold;
          margin-right: 5px;
        }
        
        .manual-resolution {
          margin-bottom: 20px;
        }
        
        .manual-editor {
          width: 100%;
          font-family: monospace;
          padding: 10px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
        }
        
        .actions {
          display: flex;
          gap: 10px;
        }
        
        button {
          padding: 8px 16px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .resolve-button {
          background-color: #007bff;
          color: white;
        }
        
        .resolve-button:hover {
          background-color: #0069d9;
        }
        
        .resolve-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .cancel-button {
          background-color: #6c757d;
          color: white;
        }
        
        .cancel-button:hover {
          background-color: #5a6268;
        }
        
        .loading, .error, .not-found {
          padding: 20px;
          text-align: center;
        }
        
        .error {
          color: #dc3545;
        }
      `}</style>
    </div>
  );
};

export default ConflictResolution;
