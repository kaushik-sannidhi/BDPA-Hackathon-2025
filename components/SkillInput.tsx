"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { commonSkills, normalizeSkill } from "@/lib/skills";
import { cn } from "@/lib/utils";

interface SkillInputProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export function SkillInput({ skills, onSkillsChange }: SkillInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim()) {
      const filtered = commonSkills
        .filter(
          (skill) =>
            skill.toLowerCase().includes(value.toLowerCase()) &&
            !skills.includes(normalizeSkill(skill))
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addSkill = (skill: string) => {
    const normalized = normalizeSkill(skill);
    if (normalized && !skills.includes(normalized)) {
      onSkillsChange([...skills, normalized]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeSkill = (skill: string) => {
    onSkillsChange(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type a skill and press Enter..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => {
              if (inputValue.trim()) addSkill(inputValue);
            }}
            size="default"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addSkill(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground first:rounded-t-md last:rounded-b-md"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="default" className="gap-1">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 rounded-full hover:bg-primary/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

