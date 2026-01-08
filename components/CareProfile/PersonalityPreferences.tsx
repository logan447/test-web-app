"use client";

interface PersonalityPreferencesData {
  personalityTraits?: string[];
  hobbiesInterests?: string[];
  communicationPreferences?: string[];
  culturalBackground?: string;
  religiousPreferences?: string;
  languagePreferences?: string[];
  petPreferences?: string;
}

interface PersonalityPreferencesProps {
  data: PersonalityPreferencesData;
  onDataChange: (field: keyof PersonalityPreferencesData, value: any) => void;
}

export default function PersonalityPreferences({
  data,
  onDataChange,
}: PersonalityPreferencesProps) {
  const personalityTraits = [
    { value: "outgoing-social", label: "Outgoing & Social" },
    { value: "quiet-reserved", label: "Quiet & Reserved" },
    { value: "independent", label: "Independent" },
    { value: "enjoys-company", label: "Enjoys Company" },
    { value: "active-energetic", label: "Active & Energetic" },
    { value: "calm-relaxed", label: "Calm & Relaxed" },
    { value: "talkative", label: "Talkative" },
    { value: "good-listener", label: "Good Listener" },
    { value: "humorous", label: "Humorous" },
    { value: "serious", label: "Serious" },
    { value: "routine-oriented", label: "Routine-Oriented" },
    { value: "spontaneous", label: "Spontaneous" },
  ];

  const hobbiesInterests = [
    { value: "reading", label: "Reading" },
    { value: "music", label: "Music" },
    { value: "arts-crafts", label: "Arts & Crafts" },
    { value: "gardening", label: "Gardening" },
    { value: "cooking-baking", label: "Cooking/Baking" },
    { value: "watching-tv-movies", label: "Watching TV/Movies" },
    { value: "puzzles-games", label: "Puzzles & Games" },
    { value: "walking", label: "Walking" },
    { value: "exercise", label: "Exercise" },
    { value: "sports", label: "Sports" },
    { value: "nature-outdoors", label: "Nature & Outdoors" },
    { value: "socializing", label: "Socializing" },
    { value: "religious-activities", label: "Religious Activities" },
    { value: "volunteering", label: "Volunteering" },
    { value: "pet-care", label: "Pet Care" },
    { value: "technology", label: "Technology/Computers" },
  ];

  const communicationStyles = [
    { value: "verbal", label: "Verbal communication works well" },
    { value: "written", label: "Prefers written communication (notes, texts)" },
    { value: "visual", label: "Responds well to visual cues and gestures" },
    { value: "patient", label: "Needs patient, slow-paced communication" },
    { value: "direct", label: "Prefers direct, clear instructions" },
    { value: "gentle", label: "Responds best to gentle, soft-spoken approach" },
  ];

  const languages = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "chinese", label: "Chinese (Mandarin/Cantonese)" },
    { value: "tagalog", label: "Tagalog" },
    { value: "vietnamese", label: "Vietnamese" },
    { value: "korean", label: "Korean" },
    { value: "russian", label: "Russian" },
    { value: "arabic", label: "Arabic" },
    { value: "french", label: "French" },
    { value: "portuguese", label: "Portuguese" },
    { value: "german", label: "German" },
    { value: "italian", label: "Italian" },
    { value: "other", label: "Other" },
  ];

  const handleArrayToggle = (field: keyof PersonalityPreferencesData, value: string) => {
    const currentArray = (data[field] as string[]) || [];

    if (currentArray.includes(value)) {
      const updated = currentArray.filter((item) => item !== value);
      onDataChange(field, updated);
    } else {
      onDataChange(field, [...currentArray, value]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Personality & Preferences
        </h2>
        <p className="text-sm text-gray-600">
          Help us understand your loved one&apos;s personality, interests, and preferences.
          This helps match them with caregivers who share similar interests and communication styles.
        </p>
      </div>

      {/* Personality Traits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Personality Traits
          <span className="text-gray-500 font-normal ml-1">
            (Select all that describe them)
          </span>
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Understanding personality helps us find caregivers with compatible temperaments
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {personalityTraits.map((trait) => (
            <label
              key={trait.value}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                data.personalityTraits?.includes(trait.value)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={data.personalityTraits?.includes(trait.value) || false}
                onChange={() => handleArrayToggle("personalityTraits", trait.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="text-sm font-medium text-gray-900">
                {trait.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Hobbies & Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hobbies & Interests
          <span className="text-gray-500 font-normal ml-1">
            (Select all that apply)
          </span>
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Shared interests help caregivers engage meaningfully and build connections
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hobbiesInterests.map((hobby) => (
            <label
              key={hobby.value}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                data.hobbiesInterests?.includes(hobby.value)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={data.hobbiesInterests?.includes(hobby.value) || false}
                onChange={() => handleArrayToggle("hobbiesInterests", hobby.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="text-sm font-medium text-gray-900">
                {hobby.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Communication Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Communication Style
          <span className="text-gray-500 font-normal ml-1">
            (Select all that apply)
          </span>
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Understanding how they communicate best helps caregivers connect effectively
        </p>
        <div className="space-y-2">
          {communicationStyles.map((style) => (
            <label
              key={style.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.communicationPreferences?.includes(style.value)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={data.communicationPreferences?.includes(style.value) || false}
                onChange={() => handleArrayToggle("communicationPreferences", style.value)}
                className="mt-0.5 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="text-sm text-gray-900">{style.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Language Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preferred Languages
          <span className="text-gray-500 font-normal ml-1">
            (Select all languages they speak or prefer)
          </span>
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Language compatibility ensures clear communication and comfort
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {languages.map((language) => (
            <label
              key={language.value}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                data.languagePreferences?.includes(language.value)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={data.languagePreferences?.includes(language.value) || false}
                onChange={() => handleArrayToggle("languagePreferences", language.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="text-sm font-medium text-gray-900">
                {language.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Cultural & Religious Preferences */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cultural Background (Optional)
          </label>
          <input
            type="text"
            value={data.culturalBackground || ""}
            onChange={(e) => onDataChange("culturalBackground", e.target.value)}
            placeholder="e.g., Italian, Chinese, Mexican"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Cultural understanding can enhance care quality
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Religious/Spiritual Preferences (Optional)
          </label>
          <input
            type="text"
            value={data.religiousPreferences || ""}
            onChange={(e) => onDataChange("religiousPreferences", e.target.value)}
            placeholder="e.g., Catholic, Jewish, Buddhist, None"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Helps match with caregivers who respect their beliefs
          </p>
        </div>
      </div>

      {/* Pet Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pet Preferences (Optional)
        </label>
        <textarea
          value={data.petPreferences || ""}
          onChange={(e) => onDataChange("petPreferences", e.target.value)}
          rows={3}
          placeholder="Does your loved one have pets? Do they love animals or prefer no pets? Any allergies? (e.g., 'Has a small dog, loves cats' or 'Allergic to cats')"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Important for matching with caregivers who can accommodate or avoid pets
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-purple-900">
              <span className="font-semibold">Building meaningful connections:</span> These
              details help us match your loved one with caregivers who share similar
              interests, communicate in compatible ways, and understand their cultural
              background. This leads to better relationships and higher quality care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
