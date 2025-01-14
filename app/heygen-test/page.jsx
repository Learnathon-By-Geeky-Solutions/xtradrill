'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";

export default function HeygenTest() {
  const [resources, setResources] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/heygen/list')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setResources(data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!resources) return <div className="p-4">No resources found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">HeyGen Resources</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Available Avatars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.avatars?.data?.map((avatar) => (
              <Card key={avatar.id}>
                <CardContent className="p-4">
                  <h3 className="font-medium">ID: {avatar.id}</h3>
                  <p className="text-sm text-gray-600">Type: {avatar.type}</p>
                  {avatar.preview_url && (
                    <img 
                      src={avatar.preview_url} 
                      alt={avatar.id}
                      className="mt-2 rounded-lg w-full"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Available Voices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.voices?.data?.map((voice) => (
              <Card key={voice.id}>
                <CardContent className="p-4">
                  <h3 className="font-medium">ID: {voice.id}</h3>
                  <p className="text-sm text-gray-600">Language: {voice.language}</p>
                  <p className="text-sm text-gray-600">Gender: {voice.gender}</p>
                  {voice.preview_url && (
                    <audio controls className="mt-2 w-full">
                      <source src={voice.preview_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
