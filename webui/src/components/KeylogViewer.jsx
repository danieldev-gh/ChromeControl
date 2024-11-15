import React, { useState, useEffect, useMemo } from "react";

// Previous helper functions remain the same
const getDomain = (url) => {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : "http://" + url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
};

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
    const currentDomain = getDomain(currentSession[0].url);
    const newDomain = getDomain(keylogs[i].url);

    if (timeDiff <= timeThreshold && currentDomain === newDomain) {
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

const processKeystrokes = (keystrokes) => {
  const result = [];
  const chars = keystrokes.split("");

  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === "[") {
      let j = i + 1;
      while (j < chars.length && chars[j] !== "]") j++;
      const specialKey = keystrokes.slice(i + 1, j);
      if (specialKey === "Backspace") {
        result.pop();
      }
      i = j;
    } else {
      result.push(chars[i]);
    }
  }

  return result.join("");
};
const KeylogViewer = ({ keylogs = [] }) => {
  // Previous state declarations remain the same
  const [dateRange, setDateRange] = useState({
    start: new Date(
      Math.min(
        ...(keylogs.length > 0 ? keylogs : [{ timestamp: 0 }]).map(
          (k) => k.timestamp
        )
      )
    ),
    end: null, // null means "now" - will show all entries up to present
  });
  useEffect(() => {
    setDateRange((prev) => ({
      ...prev,
      start: new Date(
        Math.min(
          ...(keylogs.length > 0 ? keylogs : [{ timestamp: 0 }]).map(
            (k) => k.timestamp
          )
        )
      ),
    }));
  }, [keylogs]);
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentReplayIndex, setCurrentReplayIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [selectedSessionTS, setSelectedSessionTS] = useState(null);
  const [displayText, setDisplayText] = useState("");
  const [sortOrder, setSortOrder] = useState("recent"); // 'recent' or 'oldest'

  // Previous useMemo hooks remain the same
  const filteredKeylogs = useMemo(() => {
    return keylogs.filter((keylog) => {
      const timestamp = new Date(keylog.timestamp);
      const isAfterStart = timestamp >= dateRange.start;
      const isBeforeEnd = dateRange.end ? timestamp <= dateRange.end : true;
      const isMatchingDomain =
        selectedDomain === "all" || getDomain(keylog.url) === selectedDomain;
      return isAfterStart && isBeforeEnd && isMatchingDomain;
    });
  }, [keylogs, dateRange, selectedDomain]);

  const sessions = useMemo(() => {
    const groupedSessions = groupIntoSessions(filteredKeylogs);
    return groupedSessions.sort((a, b) => {
      const aTime = a[0].timestamp;
      const bTime = b[0].timestamp;
      return sortOrder === "recent" ? bTime - aTime : aTime - bTime;
    });
  }, [filteredKeylogs, sortOrder]);
  function getSessionByTimestamp(sessions, timestamp) {
    return sessions.find((session) => {
      return session[0].timestamp === timestamp;
    });
  }

  const uniqueDomains = useMemo(() => {
    return ["all", ...new Set(keylogs.map((k) => getDomain(k.url)))];
  }, [keylogs]);

  const selectedSession = useMemo(() => {
    return selectedSessionTS !== null
      ? getSessionByTimestamp(sessions, selectedSessionTS)
      : null;
  }, [selectedSessionTS, sessions]);
  // Playback effect remains the same
  useEffect(() => {
    let animationInterval;
    if (isPlaying && selectedSession) {
      let currentText = displayText;
      let charIndex = currentCharIndex;
      if (
        displayText.length >=
        selectedSession.map((k) => k.keystrokes).join("").length
      ) {
        currentText = "";
        setCurrentCharIndex(0);
        charIndex = 0;
      }
      animationInterval = setInterval(() => {
        const allKeystrokes = selectedSession.map((k) => k.keystrokes).join("");
        if (charIndex >= allKeystrokes.length) {
          setIsPlaying(false);
          return;
        }

        if (allKeystrokes[charIndex] === "[") {
          let j = charIndex + 1;
          while (j < allKeystrokes.length && allKeystrokes[j] !== "]") j++;
          const specialKey = allKeystrokes.slice(charIndex + 1, j);

          if (specialKey === "Backspace") {
            currentText = currentText.slice(0, -1);
          }
          charIndex = j + 1;
        } else {
          currentText += allKeystrokes[charIndex];
          charIndex++;
        }
        setCurrentCharIndex(charIndex);
        setDisplayText(currentText);
      }, 50 / playbackSpeed);
    }
    return () => clearInterval(animationInterval);
  }, [isPlaying, selectedSession, currentReplayIndex, playbackSpeed]);

  // Get both raw and processed keystrokes
  const rawKeystrokes = selectedSession
    ? selectedSession.map((k) => k.keystrokes).join("")
    : "";

  const processedKeystrokes = selectedSession
    ? selectedSession.map((k) => processKeystrokes(k.keystrokes)).join("")
    : "";

  // Rest of the component remains similar, just adding new raw view
  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row gap-4 max-w-[1920px] mx-auto">
        {/* Left Column - Controls and Timeline */}
        <div className="w-full lg:w-[600px] space-y-4">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-lg outline outline-gray-300 outline-1 p-4">
            <h2 className="text-xl font-semibold mb-4">
              Keylog Viewer Controls
            </h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="border rounded p-2"
                  value={dateRange.start.toISOString().split("T")[0]}
                  onChange={(e) => {
                    setSelectedSessionTS(null);
                    setDateRange((prev) => ({
                      ...prev,
                      start: new Date(e.target.value),
                    }));
                  }}
                />
                <span>to</span>
                <input
                  type="date"
                  className="border rounded p-2"
                  value={
                    dateRange.end
                      ? dateRange.end.toISOString().split("T")[0]
                      : ""
                  }
                  placeholder="Now"
                  onChange={(e) => {
                    setSelectedSessionTS(null);
                    setDateRange((prev) => ({
                      ...prev,
                      end: e.target.value ? new Date(e.target.value) : null,
                    }));
                  }}
                />
                <select
                  className="border rounded p-2"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <select
                className="border rounded p-2 w-full"
                value={selectedDomain}
                onChange={(e) => {
                  setSelectedSessionTS(null);
                  setSelectedDomain(e.target.value);
                }}
              >
                {uniqueDomains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sessions Timeline */}
          <div className="bg-white rounded-lg shadow-lg outline outline-gray-300 outline-1 p-4 h-[calc(100vh-400px)] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Sessions Timeline</h2>
            <div className="space-y-2">
              {sessions.map((session, idx) => (
                <div
                  key={idx}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedSessionTS === session[0].timestamp
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedSessionTS(session[0].timestamp);
                    setCurrentReplayIndex(session.length - 1);
                    setCurrentCharIndex(0);
                    setIsPlaying(false);
                    setDisplayText("");
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {getDomain(session[0].url)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(session[0].timestamp).toLocaleString()} -
                      {new Date(
                        session[session.length - 1].timestamp
                      ).toLocaleString()}
                    </span>
                  </div>

                  {/* URL Changes Timeline */}
                  <div className="mt-2 text-sm">
                    {(() => {
                      const urlChanges = [];
                      let currentUrl = session[0].url;
                      let currentStartIndex = 0;

                      session.forEach((keylog, index) => {
                        if (keylog.url !== currentUrl) {
                          urlChanges.push({
                            url: currentUrl,
                            start: session[currentStartIndex].timestamp,
                            end: keylog.timestamp,
                            keyCount: index - currentStartIndex,
                          });
                          currentUrl = keylog.url;
                          currentStartIndex = index;
                        }
                      });

                      urlChanges.push({
                        url: currentUrl,
                        start: session[currentStartIndex].timestamp,
                        end: session[session.length - 1].timestamp,
                        keyCount: session.length - currentStartIndex,
                      });

                      return (
                        <div className="space-y-1">
                          {urlChanges.map((change, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-blue-200 flex-shrink-0 relative">
                                {i < urlChanges.length - 1 && (
                                  <div className="absolute w-0.5 h-full top-4 left-1/2 -translate-x-1/2 bg-blue-200" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div
                                  className="text-xs font-mono text-gray-600 truncate"
                                  title={change.url}
                                >
                                  {change.url.replace(/^https?:\/\//, "")}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(change.start).toLocaleTimeString()}{" "}
                                  • {change.keyCount} keystrokes
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="text-sm text-gray-600 mt-1">
                    Total: {session.length} keystrokes
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Replay View */}
        <div className="flex-1 lg:max-h-[calc(100vh-32px)] lg:overflow-y-auto">
          {selectedSession && (
            <div className="bg-white rounded-lg shadow-lg outline outline-gray-300 outline-1 p-4 sticky top-0">
              <h2 className="text-xl font-semibold mb-4">Replay View</h2>

              {/* Raw Database View */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  Raw Database Output:
                </h3>
                <div className="bg-gray-50 p-4 rounded font-mono text-sm overflow-x-auto border border-gray-200">
                  {rawKeystrokes}
                </div>
              </div>

              {/* Processed Raw View */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  Processed Output:
                </h3>
                <div className="bg-gray-50 p-4 rounded font-mono text-sm overflow-x-auto border border-gray-200">
                  {processedKeystrokes}
                </div>
              </div>

              {/* Replay Controls */}
              <div className="flex items-center gap-4 mb-4">
                <button
                  className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                  }}
                >
                  {isPlaying
                    ? "Pause"
                    : currentCharIndex === 0
                    ? "Play"
                    : currentCharIndex >=
                      selectedSession.map((k) => k.keystrokes).join("").length
                    ? "Replay"
                    : "Resume"}
                </button>
                <button
                  className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    setIsPlaying(false);
                    setDisplayText("");
                    setCurrentCharIndex(0);
                  }}
                >
                  Reset
                </button>
                <select
                  className="border rounded p-2"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                >
                  <option value="0.25">0.25x</option>
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
              <div className="min-h-32 p-4 border rounded bg-white font-mono whitespace-pre-wrap break-words">
                {displayText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeylogViewer;
