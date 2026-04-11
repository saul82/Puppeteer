export interface IEPData {
  meta: Meta;
  student: Student;
  parents: Parent[];
  district: District;
  eligibility: Eligibility;
  initialPlacementOnly: InitialPlacement;
  presentLevels: PresentLevels;
  goals: Goal[];
  /** Prior-year annual goals; if omitted or empty, prior-goal pages are not rendered. */
  priorGoals?: Goal[];
  specialFactors: SpecialFactors;
  esyEligibility: ESYEligibility;
  fapeServices: FAPEServices;
  placementForm: PlacementForm;
  stateAssessments: StateAssessments;
  transition: Transition;
  emergencyPlan: EmergencyPlan;
  bip: BIP;
}

export interface Meta {
  selpa: string;
  iepDate: string;
  meetingType: string;
  additionalPurpose: string | null;
  nextAnnualReview: string;
  lastReevaluation: string;
  nextReevaluation: string;
  effectiveStartDate: string;
}

export interface Student {
  legalName: string;
  suffix: string | null;
  dob: string;
  age: string;
  grade: string;
  districtId: string;
  ssid: string;
  nativeLanguage: string;
  isEL: boolean;
  isReclassified: boolean;
  interpreterNeeded: boolean;
  hispanicEthnicity: boolean;
  ethnicityBlank: boolean;
  race1: string | null;
  race2: string | null;
  race3: string | null;
  raceBlank: boolean;
  gender: string;
}

export interface Parent {
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  homePhone: string | null;
  workPhone: string | null;
  cellPhone: string | null;
  email: string | null;
}

export interface District {
  responsibleDistrict: string;
  residenceSchool: string;
  serviceDistrict: string;
  attendanceSchool: string;
  allServicesAtResidenceSchool: boolean;
}

export interface Eligibility {
  primaryDisability: string;
  secondaryDisability: string | null;
  notEligible: boolean;
  exitingSpecialEducation: boolean;
  disabilityImpactDescription: string;
}

export interface InitialPlacement {
  receivedCEIS: boolean;
  initialReferralDate: string;
  referralInitiatedBy: string;
  parentConsentDate: string;
  initialEligibilityDate: string;
}

export interface SBAC {
  elaNotApplicable: boolean;
  elaOverall: string | null;
  elaReadListening: string | null;
  elaWritingResearch: string | null;
  mathNotApplicable: boolean;
  mathOverall: string | null;
  mathConceptsProcedures: string | null;
  mathPractices: string | null;
}

export interface CAA {
  notApplicable: boolean;
  ela: string | null;
  math: string | null;
  science: string | null;
}

export interface ELPAC {
  notApplicable: boolean;
  initialELPAC: boolean;
  summativeELPAC: boolean;
  overallScore: string | null;
  overallPerformanceLevel: string | null;
  oralLanguageScore: string | null;
  writtenLanguageScore: string | null;
  listening: string | null;
  speaking: string | null;
  reading: string | null;
  writing: string | null;
}

export interface ELPACAlternate {
  initialAlternate: boolean;
  summativeAlternate: boolean;
  overallScore: string | null;
  overallPerformanceLevel: string | null;
}

export interface ScreeningResult {
  date: string | null;
  result: string | null;
}

export interface PresentLevels {
  strengthsInterests: string;
  parentConcerns: string;
  sbac: SBAC;
  caa: CAA;
  elpac: ELPAC;
  elpacAlternate: ELPACAlternate;
  physicalFitnessTest: string;
  otherEvaluationData: string;
  hearing: ScreeningResult;
  visionNearSighted: ScreeningResult;
  visionFarSighted: ScreeningResult;
  preAcademicSkills: string;
  communicationDevelopment: string;
  motorDevelopment: string;
  socialEmotionalBehavior: string;
  vocational: string;
  dailyLivingSkills: string;
  health: string;
  hasIndividualHealthPlan: boolean;
  areasOfNeed: string;
}

export interface ProgressReport {
  reportNumber: number;
  date: string | null;
  summary: string | null;
  comments: string | null;
}

export interface ShortTermObjective {
  targetDate: string;
  objective: string;
}

export interface Goal {
  goalNumber: string;
  areaOfNeed: string;
  baselineLevel: string;
  annualGoal: string;
  alignsToGeneralCurriculum: boolean;
  stateStandard: string;
  addressesOtherNeeds: boolean;
  linguisticallyAppropriate: boolean;
  isTransitionGoal: boolean;
  transitionType: string | null;
  responsiblePerson: string;
  progressReports: ProgressReport[];
  annualReviewDate: string | null;
  goalMet: boolean | null;
  annualReviewComments: string | null;
  shortTermObjectives: ShortTermObjective[];
}

export interface SpecialFactors {
  needsAssistiveTechnology: boolean;
  atRationale: string | null;
  needsLowFrequencyEquipment: boolean;
  lowFrequencyDetails: string | null;
  blindVisualImpairmentConsiderations: string;
  deafHearingImpairmentConsiderations: string;
  isELStudent: boolean;
  eldPrimaryLanguageSupport: boolean | null;
  eldSupportStrategies: string[];
  eldProgramLocation: string | null;
  eldProgramType: string | null;
  behaviorImpactsLearning: boolean;
  behaviorDescription: string | null;
  behaviorInterventions: string | null;
  behaviorGoalInIEP: boolean;
  bipAttached: boolean;
}

export interface ESYEligibility {
  age: number;
  grade: string;
  q1_unableToRecoupSkills: boolean;
  q1_area: string | null;
  q2_lossOfSkillsDuringBreaks: boolean;
  q2_area: string | null;
  q3_criticalLearningStage: boolean;
  q3_skills: string | null;
  q4_canMaintainWithoutESY: boolean;
  q4_skill: string | null;
  q5_requiresESY: boolean;
}

export interface Adaptation {
  description: string;
  startDate: string;
  endDate: string;
  location: string;
}

export interface Modification {
  description: string;
  startDate: string;
  endDate: string;
  frequency: string;
  duration: string;
  location: string;
}

export interface OtherSupport {
  description: string;
  supports: string;
  startDate: string;
  endDate: string;
  frequency: string;
  duration: string;
  location: string;
}

export interface SpecialEdService {
  service: string;
  startDate: string;
  endDate: string;
  provider: string;
  deliveryModel: string;
  isSecTransition: boolean;
  minutesPerSession: number;
  sessionsPerWeek: number;
  totalMinutesPerWeek: number;
  frequency: string;
  location: string;
  comments: string | null;
}

export interface FAPEServices {
  servicesConsidered: string;
  lreDescription: string;
  programAdaptationsNeeded: boolean;
  adaptations: Adaptation[];
  programModificationsNeeded: boolean;
  modifications: Modification[];
  otherSupportsNeeded: boolean;
  otherSupports: OtherSupport[];
  specialEdServices: SpecialEdService[];
  specialEdTransportation: boolean;
  transportationNotes: string;
  esyQualifies: boolean;
  esyRationale: string;
}

export interface PlacementForm {
  physicalEducation: string;
  allServicesAtResidenceSchool: boolean;
  preschoolProgramEnvironment: string | null;
  preschoolTenHoursOrMore: boolean | null;
  programEnvironment: string;
  percentTimeOutsideRegularClass: number;
  percentTimeInsideRegularClass: number;
  nonParticipationReason: string;
  otherAgencies: OtherAgencies;
  promotionRequirements: string;
  parentProgressNotification: string;
  progressReportMethod: string;
  transitionActivities: string;
}

export interface OtherAgencies {
  ccs: boolean;
  regionalCenter: boolean;
  probation: boolean;
  rehabilitation: boolean;
  dss: boolean;
  countyMentalHealth: boolean;
  other: string | null;
}

export interface AssessmentSubject {
  gradeLevel?: string;
  withAccommodations?: boolean;
  sbacDesignatedSupportsIntegrated?: boolean;
  integratedSupportsDetail?: string;
  sbacDesignatedSupportsNonIntegrated?: boolean;
  nonIntegratedSupportsDetail?: string;
  sbacAdaptationsIntegrated?: boolean;
  sbacAdaptationsNonIntegrated?: boolean;
  nonIntegratedAdaptationsDetail?: string;
  sbacAccessibilitySupport?: boolean;
  castDesignatedSupportsIntegrated?: boolean;
  castDesignatedSupportsNonIntegrated?: boolean;
  castAdaptationsIntegrated?: boolean;
  castAdaptationsNonIntegrated?: boolean;
  castAccessibilitySupport?: boolean;
}

export interface PhysicalFitness {
  gradeApplicable: boolean;
  withoutAccommodations: boolean;
  withAccommodations: boolean;
  withModifications: boolean;
}

export interface ELPACAssessment {
  notApplicable?: boolean;
  summativeELPAC?: boolean;
  designatedSupportsIntegrated?: boolean;
  integratedSupportsDetail?: string;
  designatedSupportsNonIntegrated?: boolean;
  nonIntegratedSupportsDetail?: string;
}

export interface StateAssessments {
  ela: AssessmentSubject;
  math: AssessmentSubject;
  science: AssessmentSubject;
  takingAlternateAssessment: boolean;
  physicalFitness: PhysicalFitness;
  elpac: ELPACAssessment;
}

export interface TransitionGoal {
  postSecondaryStatement: string;
  transitionServiceCode: string;
  activitiesToSupportGoal: string;
  communityExperiences: string;
  connectedToAnnualGoalNumber: string | null;
  relatedServices: string | null;
  responsiblePerson: string;
}

export interface Transition {
  studentInvited: boolean;
  agenciesInvited: boolean;
  agenciesDetails: string | null;
  studentParticipationMethod: string | null;
  ageAppropriateTransitionAssessmentsUsed: boolean;
  assessmentResultsDescription: string | null;
  postsecondaryEducationGoal: string | null;
  postsecondaryEmploymentGoal: string | null;
  postsecondaryIndependentLivingGoal: string | null;
  graduationRequirements: string | null;
  courseOfStudyMultiYear: boolean;
  creditsCompleted: string | null;
  creditsPending: string | null;
  leadingTo: string | null;
  expectedCompletionDate: string | null;
  alternativePathwayEligible: boolean;
  majorityOfAgeNotified: boolean;
  majorityOfAgeNotifiedBy: string | null;
  majorityOfAgeNotifiedDate: string | null;
  underGuardianship: boolean;
  appropriatePostsecondaryMeasuresExist: boolean;
  postsecondaryGoalsUpdatedWithAnnualIEP: boolean;
  transitionServicesIncluded: boolean;
  annualGoalsRelatedToTransition: boolean;
  transitionGoals: TransitionGoal[];
}

export interface EmergencyDelivery {
  interactiveClassMeetingsOnline: boolean;
  scheduledAppointmentsWithTeacher: boolean;
  otherMethods: string[];
}

export interface EmergencyPlan {
  specializedAcademicInstruction: EmergencyDelivery;
  transitionServices: string;
  esyServices: string;
  supplementaryAidsServices: Record<string, unknown>;
}

export interface FunctionalFactors {
  tangible: string | null;
  escapeProblem: string | null;
  sensoryIssue: string | null;
  attention: string | null;
}

export interface BIP {
  bipDate: string | null;
  basedOn: string[];
  behaviorDescription: string | null;
  frequency: string | null;
  intensity: string | null;
  duration: string | null;
  reportedBy: string | null;
  observedBy: string | null;
  antecedents: string | null;
  environmentalSupports: string | null;
  functionalFactors: FunctionalFactors;
  ferbReplacementBehavior: string | null;
  teachingStrategies: string | null;
  reinforcementProcedures: string | null;
  reinforcerSelectionBasis: string | null;
  responseToProblematicBehavior: string[];
  behaviorGoalInIEP: boolean;
}
