import React, { useState, useEffect, useMemo } from "react";

// Helper function to group keylogs into sessions
const groupIntoSessions = (keylogs, timeThreshold = 60000) => {
  const sessions = [];
  let currentSession = [];

  for (let i = 0; i < keylogs.length; i++) {
    if (currentSession.length === 0) {
      currentSession.push(keylogs[i]);
      continue;
    }

    const timeDiff =
      keylogs[i].timestamp -
      currentSession[currentSession.length - 1].timestamp;
    if (timeDiff <= timeThreshold && keylogs[i].url === currentSession[0].url) {
      currentSession.push(keylogs[i]);
    } else {
      sessions.push([...currentSession]);
      currentSession = [keylogs[i]];
    }
  }

  if (currentSession.length > 0) {
    sessions.push(currentSession);
  }

  return sessions;
};

const KeylogViewer = ({ keylogs = [] }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Math.min(...keylogs.map((k) => k.timestamp))),
    end: new Date(Math.max(...keylogs.map((k) => k.timestamp))),
  });
  const [selectedUrl, setSelectedUrl] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentReplayIndex, setCurrentReplayIndex] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);

  // Filter and process keylogs based on date range and URL
  const filteredKeylogs = useMemo(() => {
    return keylogs.filter((keylog) => {
      const timestamp = new Date(keylog.timestamp);
      const isInDateRange =
        timestamp >= dateRange.start && timestamp <= dateRange.end;
      const isMatchingUrl = selectedUrl === "all" || keylog.url === selectedUrl;
      return isInDateRange && isMatchingUrl;
    });
  }, [keylogs, dateRange, selectedUrl]);

  // Group filtered keylogs into sessions
  const sessions = useMemo(() => {
    return groupIntoSessions(filteredKeylogs);
  }, [filteredKeylogs]);

  // Get unique URLs for filter dropdown
  const uniqueUrls = useMemo(() => {
    return ["all", ...new Set(keylogs.map((k) => k.url))];
  }, [keylogs]);

  // Handle playback
  useEffect(() => {
    let playbackInterval;
    if (isPlaying && selectedSession) {
      playbackInterval = setInterval(() => {
        setCurrentReplayIndex((prev) => {
          if (prev >= selectedSession.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100 / playbackSpeed);
    }
    return () => clearInterval(playbackInterval);
  }, [isPlaying, selectedSession, playbackSpeed]);

  // Get concatenated keystrokes for selected session
  const concatenatedKeystrokes = selectedSession
    ? selectedSession.map((k) => k.keystrokes).join("")
    : "";

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Keylog Viewer Controls</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="border rounded p-2"
              value={dateRange.start.toISOString().split("T")[0]}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  start: new Date(e.target.value),
                }))
              }
            />
            <span>to</span>
            <input
              type="date"
              className="border rounded p-2"
              value={dateRange.end.toISOString().split("T")[0]}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  end: new Date(e.target.value),
                }))
              }
            />
          </div>

          <select
            className="border rounded p-2"
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
          >
            {uniqueUrls.map((url) => (
              <option key={url} value={url}>
                {url}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Timeline */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Sessions Timeline</h2>
        <div className="space-y-2">
          {sessions.map((session, idx) => (
            <div
              key={idx}
              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedSession === session ? "bg-blue-50 border-blue-200" : ""
              }`}
              onClick={() => {
                setSelectedSession(session);
                setCurrentReplayIndex(0);
                setIsPlaying(false);
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{session[0].url}</span>
                <span className="text-sm text-gray-500">
                  {new Date(session[0].timestamp).toLocaleString()} -
                  {new Date(
                    session[session.length - 1].timestamp
                  ).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {session.length} keystrokes
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Replay Area */}
      {selectedSession && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Replay View</h2>

          {/* Raw Data */}
          <div className="bg-gray-50 p-4 rounded font-mono text-sm overflow-x-auto mb-4">
            {concatenatedKeystrokes}
          </div>

          {/* Replay Controls */}
          <div className="flex items-center gap-4 mb-4">
            <button
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <select
              className="border rounded p-2"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="4">4x</option>
            </select>

            <div className="text-sm text-gray-500">
              {new Date(
                selectedSession[currentReplayIndex].timestamp
              ).toLocaleString()}
            </div>
          </div>

          {/* Replay Display */}
          <div className="min-h-32 p-4 border rounded bg-white font-mono">
            {selectedSession
              .slice(0, currentReplayIndex + 1)
              .map((k) => k.keystrokes)
              .join("")}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeylogViewer;
