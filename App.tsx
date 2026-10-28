import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Idea = {
  id: string;
  title: string;
  niche: string;
  problem: string;
  audience: string;
  valueProp: string;
  opportunity: number;
  revenue: number;
  status: 'Idea' | 'Researching' | 'Testing';
};

type CreditPack = {
  id: string;
  label: string;
  amount: number;
  price: string;
};

const starterIdeas: Idea[] = [
  {
    id: 'idea-1',
    title: 'AI Local Lead Finder',
    niche: 'Local services',
    problem: 'Small service businesses lose clients because they do not know which leads are worth pursuing.',
    audience: 'Freelance marketers, SEO agencies, local service owners',
    valueProp: 'Weekly AI-generated lead lists with customer intent scoring and pricing guidance.',
    opportunity: 94,
    revenue: 32880,
    status: 'Testing',
  },
  {
    id: 'idea-2',
    title: 'Revenue Recovery Audit',
    niche: 'E-commerce',
    problem: 'Online stores leak cash through abandoned carts, forgotten subscriptions, and weak retention tactics.',
    audience: 'Shopify owners, DTC founders, email marketing teams',
    valueProp: 'An AI audit that shows revenue leaks and a 30-day recovery playbook.',
    opportunity: 90,
    revenue: 24750,
    status: 'Researching',
  },
  {
    id: 'idea-3',
    title: 'Creator Prompt Vault',
    niche: 'Content creators',
    problem: 'Creators spend hours rebuilding prompts, repurposing content, and chasing campaign ideas.',
    audience: 'YouTubers, TikTok creators, digital agencies',
    valueProp: 'A searchable prompt library for scripts, hooks, product ideas, and brand analysis.',
    opportunity: 86,
    revenue: 18400,
    status: 'Idea',
  },
];

const creditPacks: CreditPack[] = [
  { id: 'pack-5', label: '5 credits', amount: 5, price: '$4.99' },
  { id: 'pack-12', label: '12 credits', amount: 12, price: '$9.99' },
  { id: 'pack-30', label: '30 credits', amount: 30, price: '$22.99' },
];

const storageKey = 'creator-earn-ai-state';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const scoreColor = (score: number) => {
  if (score >= 85) return '#34d399';
  if (score >= 70) return '#fbbf24';
  return '#f87171';
};

export default function App() {
  const [ideas, setIdeas] = useState<Idea[]>(starterIdeas);
  const [selectedId, setSelectedId] = useState(starterIdeas[0].id);
  const [credits, setCredits] = useState(5);
  const [isLoaded, setIsLoaded] = useState(false);

  const selectedIdea = useMemo(
    () => ideas.find((idea) => idea.id === selectedId) ?? ideas[0],
    [ideas, selectedId]
  );

  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.ideas) setIdeas(parsed.ideas);
          if (parsed.selectedId) setSelectedId(parsed.selectedId);
          if (typeof parsed.credits === 'number') setCredits(parsed.credits);
        }
      } catch (error) {
        console.warn('Unable to load saved state', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadState();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const persistState = async () => {
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify({
          ideas,
          selectedId,
          credits,
        })
      );
    };

    persistState();
  }, [ideas, selectedId, credits, isLoaded]);

  const updateSelectedIdea = (field: keyof Idea, value: string | number) => {
    if (!selectedIdea) return;

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === selectedIdea.id ? { ...idea, [field]: value } : idea
      )
    );
  };

  const addIdea = () => {
    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      title: 'New app idea',
      niche: 'General',
      problem: 'Describe the core user pain point and why it matters today.',
      audience: 'Start with the primary audience for the product.',
      valueProp: 'Explain the unique value and why users would pay.',
      opportunity: 76,
      revenue: 12000,
      status: 'Idea',
    };

    setIdeas((currentIdeas) => [newIdea, ...currentIdeas]);
    setSelectedId(newIdea.id);
  };

  const addCredits = (amount: number) => {
    setCredits((value) => value + amount);
    Alert.alert('Credits added', `You now have ${credits + amount} paid credits.`);
  };

  const calculateRevenue = () => {
    if (!selectedIdea) return;

    const estimatedRevenue = Math.round(
      selectedIdea.opportunity * selectedIdea.revenue * 0.0033
    );

    updateSelectedIdea('revenue', estimatedRevenue);
    Alert.alert('Estimate refreshed', `Updated estimate to ${currency.format(estimatedRevenue)}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#07111f" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Creator economy tracker</Text>
            <Text style={styles.title}>CreatorEarn AI</Text>
          </View>
          <Pressable style={styles.creditBadge} onPress={() => Alert.alert('Credits', `Available credits: ${credits}`)}>
            <Text style={styles.creditText}>{credits} credits</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Opportunity dashboard</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Ideas</Text>
              <Text style={styles.metricValue}>{ideas.length}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Best score</Text>
              <Text style={styles.metricValue}>{Math.max(...ideas.map((idea) => idea.opportunity))}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Pipeline</Text>
              <Text style={styles.metricValue}>{currency.format(ideas.reduce((sum, idea) => sum + idea.revenue, 0))}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved ideas</Text>
          <Pressable style={styles.primaryButton} onPress={addIdea}>
            <Text style={styles.primaryButtonText}>+ New idea</Text>
          </Pressable>
        </View>

        {ideas.map((idea) => {
          const isSelected = idea.id === selectedIdea?.id;

          return (
            <Pressable
              key={idea.id}
              onPress={() => setSelectedId(idea.id)}
              style={[styles.ideaCard, isSelected && styles.ideaCardSelected]}
            >
              <View style={styles.ideaTopRow}>
                <Text style={styles.ideaTitle}>{idea.title}</Text>
                <Text style={[styles.score, { color: scoreColor(idea.opportunity) }]}>{idea.opportunity}</Text>
              </View>
              <Text style={styles.ideaMeta}>{idea.niche}</Text>
              <Text style={styles.ideaCopy}>{idea.valueProp}</Text>
              <View style={styles.ideaFooter}>
                <Text style={styles.revenueText}>{currency.format(idea.revenue)}</Text>
                <Text style={styles.statusText}>{idea.status}</Text>
              </View>
            </Pressable>
          );
        })}

        {selectedIdea && (
          <View style={styles.editorCard}>
            <View style={styles.editorHeader}>
              <Text style={styles.sectionTitle}>Idea editor</Text>
              <Pressable style={styles.secondaryButton} onPress={calculateRevenue}>
                <Text style={styles.secondaryButtonText}>Refresh estimate</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={selectedIdea.title}
              onChangeText={(text) => updateSelectedIdea('title', text)}
            />

            <Text style={styles.label}>Niche</Text>
            <TextInput
              style={styles.input}
              value={selectedIdea.niche}
              onChangeText={(text) => updateSelectedIdea('niche', text)}
            />

            <Text style={styles.label}>Core problem</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={selectedIdea.problem}
              multiline
              onChangeText={(text) => updateSelectedIdea('problem', text)}
            />

            <Text style={styles.label}>Target audience</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={selectedIdea.audience}
              multiline
              onChangeText={(text) => updateSelectedIdea('audience', text)}
            />

            <Text style={styles.label}>Value proposition</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={selectedIdea.valueProp}
              multiline
              onChangeText={(text) => updateSelectedIdea('valueProp', text)}
            />

            <View style={styles.inlineFields}>
              <View style={styles.inlineField}>
                <Text style={styles.label}>Opportunity score</Text>
                <TextInput
                  style={styles.input}
                  value={String(selectedIdea.opportunity)}
                  keyboardType="numeric"
                  onChangeText={(text) => updateSelectedIdea('opportunity', Number(text || 0))}
                />
              </View>

              <View style={styles.inlineField}>
                <Text style={styles.label}>Revenue</Text>
                <TextInput
                  style={styles.input}
                  value={String(selectedIdea.revenue)}
                  keyboardType="numeric"
                  onChangeText={(text) => updateSelectedIdea('revenue', Number(text || 0))}
                />
              </View>
            </View>

            <Text style={styles.label}>Status</Text>
            <TextInput
              style={styles.input}
              value={selectedIdea.status}
              onChangeText={(text) => updateSelectedIdea('status', text as Idea['status'])}
            />
          </View>
        )}

        <View style={styles.purchaseCard}>
          <Text style={styles.sectionTitle}>Buy extra credits</Text>
          <Text style={styles.purchaseCopy}>
            Unlock deeper analysis, competitor ideas, and premium validation reports.
          </Text>

          {creditPacks.map((pack) => (
            <Pressable key={pack.id} style={styles.purchaseOption} onPress={() => addCredits(pack.amount)}>
              <Text style={styles.purchaseLabel}>{pack.label}</Text>
              <Text style={styles.purchasePrice}>{pack.price}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  container: {
    padding: 18,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  eyebrow: {
    color: '#7dd3fc',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '800',
  },
  creditBadge: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  creditText: {
    color: '#ecfeff',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  metric: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 4,
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#eff6ff',
    fontWeight: '700',
  },
  ideaCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
  },
  ideaCardSelected: {
    borderColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  ideaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ideaTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    maxWidth: '80%',
  },
  score: {
    fontSize: 18,
    fontWeight: '800',
  },
  ideaMeta: {
    color: '#7dd3fc',
    fontSize: 12,
    marginBottom: 8,
  },
  ideaCopy: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  ideaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueText: {
    color: '#fbbf24',
    fontWeight: '700',
  },
  statusText: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '600',
  },
  editorCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginTop: 14,
    marginBottom: 18,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#ecfeff',
    fontWeight: '700',
    fontSize: 12,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8fafc',
  },
  textArea: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  inlineFields: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  inlineField: {
    flex: 1,
  },
  purchaseCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
  },
  purchaseCopy: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  purchaseOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  purchaseLabel: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  purchasePrice: {
    color: '#7dd3fc',
    fontWeight: '800',
  },
});
