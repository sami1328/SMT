'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Trainee {
  tid: string;
  name: string;
  preferred_position: string;
  birth_date: string;
}

interface TestResult {
  id: string;
  tid: string;
  acceleration: number;
  agility: number;
  balance: number;
  jumping: number;
  reactions: number;
  sprint_speed: number;
  stamina: number;
  strength: number;
  aggression: number;
  att_position: number;
  composure: number;
  interceptions: number;
  vision: number;
  ball_control: number;
  crossing: number;
  curve: number;
  defensive_awareness: number;
  dribbling: number;
  fk_accuracy: number;
  finishing: number;
  heading_accuracy: number;
  long_passing: number;
  long_shots: number;
  penalties: number;
  short_passing: number;
  shot_power: number;
  sliding_tackle: number;
  standing_tackle: number;
  volleys: number;
  gk_diving: number;
  gk_handling: number;
  gk_kicking: number;
  gk_positioning: number;
  gk_reflexes: number;
  created_at: string;
}

export default function TraineeResults({ params }: { params: { sid: string; tid: string } }) {
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchTraineeData();
    fetchTestResults();
  }, []);

  const fetchTraineeData = async () => {
    try {
      const { data, error } = await supabase
        .from('trainees')
        .select('*')
        .eq('tid', params.tid)
        .single();

      if (error) throw error;
      setTrainee(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching trainee data');
    }
  };

  const fetchTestResults = async () => {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('tid', params.tid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestResults(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching test results');
    } finally {
      setLoading(false);
    }
  };

  const calculateCategoryAverage = (results: TestResult, category: string) => {
    switch (category) {
      case 'Physical':
        return Math.round(
          (results.acceleration + results.agility + results.balance + 
           results.jumping + results.reactions + results.sprint_speed + 
           results.stamina + results.strength) / 8
        );
      case 'Mental':
        return Math.round(
          (results.aggression + results.att_position + results.composure + 
           results.interceptions + results.vision) / 5
        );
      case 'Technical':
        return Math.round(
          (results.ball_control + results.crossing + results.curve + 
           results.defensive_awareness + results.dribbling + results.fk_accuracy + 
           results.finishing + results.heading_accuracy + results.long_passing + 
           results.long_shots + results.penalties + results.short_passing + 
           results.shot_power + results.sliding_tackle + results.standing_tackle + 
           results.volleys) / 17
        );
      case 'Goalkeeper':
        return Math.round(
          (results.gk_diving + results.gk_handling + results.gk_kicking + 
           results.gk_positioning + results.gk_reflexes) / 5
        );
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  if (!trainee || testResults.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black text-xl">No test results found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Test Results</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-[#555555] hover:text-black transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Trainee Info */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-[#E6E6E6]">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-[#555555]">
                {trainee.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-black">{trainee.name}</h2>
              <p className="text-[#555555]">{trainee.preferred_position}</p>
              <p className="text-sm text-[#555555]">
                Age: {Math.floor((new Date().getTime() - new Date(trainee.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25))}
              </p>
            </div>
          </div>
        </div>

        {/* Latest Test Results */}
        <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
          <h2 className="text-xl font-semibold text-black mb-6">Latest Test Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {['Physical', 'Mental', 'Technical', 'Goalkeeper'].map((category) => (
              <div key={category} className="bg-white rounded-lg p-4 border border-[#E6E6E6]">
                <h3 className="text-lg font-medium text-black mb-2">{category}</h3>
                <div className="text-3xl font-bold text-[#14D922]">
                  {calculateCategoryAverage(testResults[0], category)}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Results */}
          <div className="space-y-8">
            {/* Physical Attributes */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Physical Attributes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'acceleration', label: 'Acceleration' },
                  { key: 'agility', label: 'Agility' },
                  { key: 'balance', label: 'Balance' },
                  { key: 'jumping', label: 'Jumping' },
                  { key: 'reactions', label: 'Reactions' },
                  { key: 'sprint_speed', label: 'Sprint Speed' },
                  { key: 'stamina', label: 'Stamina' },
                  { key: 'strength', label: 'Strength' }
                ].map(({ key, label }) => (
                  <div key={key} className="bg-white rounded-lg p-4 border border-[#E6E6E6]">
                    <div className="text-sm font-medium text-[#555555] mb-1">{label}</div>
                    <div className="text-2xl font-bold text-black">
                      {testResults[0][key as keyof TestResult]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mental Attributes */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Mental Attributes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'aggression', label: 'Aggression' },
                  { key: 'att_position', label: 'Attacking Position' },
                  { key: 'composure', label: 'Composure' },
                  { key: 'interceptions', label: 'Interceptions' },
                  { key: 'vision', label: 'Vision' }
                ].map(({ key, label }) => (
                  <div key={key} className="bg-white rounded-lg p-4 border border-[#E6E6E6]">
                    <div className="text-sm font-medium text-[#555555] mb-1">{label}</div>
                    <div className="text-2xl font-bold text-black">
                      {testResults[0][key as keyof TestResult]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Attributes */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Technical Attributes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'ball_control', label: 'Ball Control' },
                  { key: 'crossing', label: 'Crossing' },
                  { key: 'curve', label: 'Curve' },
                  { key: 'defensive_awareness', label: 'Defensive Awareness' },
                  { key: 'dribbling', label: 'Dribbling' },
                  { key: 'fk_accuracy', label: 'Free Kick Accuracy' },
                  { key: 'finishing', label: 'Finishing' },
                  { key: 'heading_accuracy', label: 'Heading Accuracy' },
                  { key: 'long_passing', label: 'Long Passing' },
                  { key: 'long_shots', label: 'Long Shots' },
                  { key: 'penalties', label: 'Penalties' },
                  { key: 'short_passing', label: 'Short Passing' },
                  { key: 'shot_power', label: 'Shot Power' },
                  { key: 'sliding_tackle', label: 'Sliding Tackle' },
                  { key: 'standing_tackle', label: 'Standing Tackle' },
                  { key: 'volleys', label: 'Volleys' }
                ].map(({ key, label }) => (
                  <div key={key} className="bg-white rounded-lg p-4 border border-[#E6E6E6]">
                    <div className="text-sm font-medium text-[#555555] mb-1">{label}</div>
                    <div className="text-2xl font-bold text-black">
                      {testResults[0][key as keyof TestResult]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goalkeeper Attributes */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Goalkeeper Attributes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'gk_diving', label: 'Diving' },
                  { key: 'gk_handling', label: 'Handling' },
                  { key: 'gk_kicking', label: 'Kicking' },
                  { key: 'gk_positioning', label: 'Positioning' },
                  { key: 'gk_reflexes', label: 'Reflexes' }
                ].map(({ key, label }) => (
                  <div key={key} className="bg-white rounded-lg p-4 border border-[#E6E6E6]">
                    <div className="text-sm font-medium text-[#555555] mb-1">{label}</div>
                    <div className="text-2xl font-bold text-black">
                      {testResults[0][key as keyof TestResult]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 