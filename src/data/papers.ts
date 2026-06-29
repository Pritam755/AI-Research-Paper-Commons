import { ResearchPaper } from "../types";

export const PRE_AUTHORED_PAPERS: ResearchPaper[] = [
  {
    id: "gqa-optimization-2026",
    title: "Optimization of Grouped-Query Attention for Multi-Tenant Low-Latency Inference",
    authors: [
      "Dr. Elena Vance",
      "Marcus Chen",
      "Prof. Sarah Jenkins"
    ],
    affiliations: [
      "Open Science Initiative for Intelligence (OSII)",
      "Collaborative AI Research Laboratories"
    ],
    date: "March 2026",
    doi: "10.5555/osii.2026.04821",
    category: "Optimization",
    abstract: "Memory bandwidth constraints during the autoregressive decoding phase represent the primary bottleneck in scaling Large Language Model (LLM) inference. While Grouped-Query Attention (GQA) mitigates this by mapping multiple query heads to a single key-value (KV) head, optimal partitioning strategies remain under-explored in multi-tenant, dynamic load environments. In this paper, we present Adaptive GQA (A-GQA), a runtime optimization framework that dynamically scales the group factor $G$ and memory allocation based on token throughput, sequence length, and priority queue states. Across several trials with LLaMA-style 70B parameter models, A-GQA achieves a 1.4x increase in decoding token throughput and a 42% reduction in Time-to-First-Token (TTFT) compared to static GQA layouts, with negligible degradation in task accuracy (under 0.15% on MMLU benchmarks). We release all results, metrics, and implementations under a Creative Commons Zero (CC0) license to enable unified, low-overhead public hosting.",
    sections: [
      {
        title: "1. Introduction",
        content: `As Large Language Models (LLMs) scale to hundreds of billions of parameters, deploying them efficiently in multi-tenant cloud environments becomes an increasingly complex challenge. The primary bottleneck during the autoregressive generation phase is not compute, but **memory bandwidth**. Each token generated requires loading all model parameters, plus the cumulative Key-Value (KV) cache for all previous tokens in the sequence, from High Bandwidth Memory (HBM) to the processor cache.

Standard Multi-Head Attention (MHA) allocates separate Key and Value projections for every Query head, resulting in a substantial memory footprint for the KV cache. To combat this, Multi-Query Attention (MQA) collapses all KV heads to a single projection, drastically reducing memory usage but introducing performance degradation on complex reasoning tasks due to limited capacity.

Grouped-Query Attention (GQA) offers an elegant trade-off by grouping query heads into $H_Q / H_{KV}$ blocks, projecting a single key-value set per block. However, standard GQA utilizes a static group ratio determined at training time, which is highly suboptimal for multi-tenant settings where latency requirements and prompt-to-response length ratios vary continuously.

In this work, we introduce **Adaptive GQA (A-GQA)**, which enables dynamic adjustments of the attention topology at runtime. We make the following contributions:
* We formulate a mathematical model mapping the memory access characteristics of multi-tenant environments under various group factors.
* We present an online scheduler that switches head-group topologies dynamically without re-training.
* We evaluate our method on several open-source foundational models and demonstrate dramatic throughput benefits.
* We release our findings, designs, and evaluation data completely free of copyright restrictions for public advancement.`
      },
      {
        title: "2. Methodology & Topology Adaptation",
        content: `The mathematical formulation of standard Multi-Head Attention represents queries, keys, and values as:

$$Q = XW_Q, \\quad K = XW_K, \\quad V = XW_V$$

In GQA with $G$ groups, the query heads $h = 1, \\dots, H_Q$ are mapped to KV heads according to:

$$\\text{group}(h) = \\lfloor h \\cdot H_{KV} / H_Q \\rfloor$$

Our proposed **A-GQA** introduces an intermediate interpolation layer that permits fractional head associations. When the sequence length exceeds a critical threshold $L_{crit}$, the scheduling controller triggers a compression of the KV cache by merging adjacent KV channels using a weighted linear projection.

### Algorithm 1: Dynamic KV Rescaling
1. **Initialize** inference engine with default group ratio $G_{base}$.
2. **Monitor** incoming request queues and available HBM allocation $M_{avail}$.
3. **If** queue length exceeds threshold $Q_{limit}$:
   - Compress KV cache using a low-rank linear projection matrices $W_{comp}$:
     $$K_{compressed} = K \\cdot W_{comp}, \\quad V_{compressed} = V \\cdot W_{comp}$$
   - Set current group factor $G_{active} \\leftarrow G_{base} \\times 2$.
4. **Else if** sequence length $L$ for active queries is small ($L < 128$):
   - Allocate standard MHA parameters to maintain maximum representation fidelity.
5. **Yield** attention heads for standard softmax computation.`
      },
      {
        title: "3. Empirical Results",
        content: `We evaluated A-GQA on an 8x NVIDIA H100 (80GB SXM5) node. Our base model is an open LLaMA-based architecture with 70 Billion parameters, pre-trained with a native GQA ratio of 8:1 (64 Query heads, 8 KV heads).

We simulated a multi-tenant benchmark consisting of mixed-length prompts (ranging from 512 to 8,192 input tokens) with concurrency scaling from 1 to 64 parallel streams.

| Metric | Baseline Static GQA (8:1) | MQA (64:1) | Proposed A-GQA (Dynamic) |
| :--- | :---: | :---: | :---: |
| **Max Throughput (tokens/sec)** | 1,420 | 1,980 | **2,010** |
| **Median TTFT (ms)** | 185 | 92 | **107** |
| **Memory Capacity Overhead** | 12.4 GB | 1.8 GB | **4.2 GB** |
| **Average MMLU Accuracy (%)** | 78.4% | 75.1% | **78.3%** |

As shown in the table above, A-GQA recovers almost all the accuracy lost by MQA while matching or exceeding MQA's maximum throughput, operating with a memory footprint that scales gracefully with queue pressure.`
      },
      {
        title: "4. Discussion & Open-Source Ethics",
        content: `The results indicate that fixed attention topologies represent an artificial limit imposed by training architectures. By decoupling runtime inference paths from static weights, memory-compute efficiency can scale dynamically with user load.

From an ethical and accessibility perspective, the concentration of massive LLM inference infrastructures inside high-capital private entities poses a significant risk to open research. Traditional paywalled scientific publications further exacerbate this digital divide. 

By dedicating this research directly to the public domain (CC0), we hope to democratize cost-efficient inference techniques, allowing independent researchers and grassroots organizations to run state-of-the-art architectures on accessible consumer-grade hardware layouts.`
      },
      {
        title: "5. References",
        content: `1. Vaswani, A., et al. (2017). "Attention Is All You Need." Advances in Neural Information Processing Systems.
2. Shazeer, N. (2019). "Fast Transformer Decoding: One Write-Head is All You Need." arXiv preprint arXiv:1911.02150.
3. Ainslie, J., et al. (2023). "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints." Conference on Empirical Methods in Natural Language Processing (EMNLP).
4. Touvron, H., et al. (2023). "LLaMA: Open and Efficient Foundation Language Models." Meta AI Technical Report.`
      }
    ],
    references: [
      "Vaswani, A., et al. (2017). 'Attention Is All You Need.' NeurIPS 2017.",
      "Shazeer, N. (2019). 'Fast Transformer Decoding: One Write-Head is All You Need.' arXiv:1911.02150.",
      "Ainslie, J., et al. (2023). 'GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints.' EMNLP 2023.",
      "Touvron, H., et al. (2023). 'LLaMA: Open and Efficient Foundation Language Models.' Meta AI Technical Report."
    ]
  },
  {
    id: "dpo-adaptive-margin-2026",
    title: "Direct Preference Optimization with Adaptive Margin Regulation for Fine-Grained Alignment",
    authors: [
      "Sophia Martinez",
      "Dr. Liam O'Connor"
    ],
    affiliations: [
      "Global Alliance for Democratic AI (GADA)",
      "Open Science Initiative for Intelligence (OSII)"
    ],
    date: "May 2026",
    doi: "10.5555/osii.2026.09115",
    category: "Alignment",
    abstract: "Direct Preference Optimization (DPO) has emerged as a lightweight, robust alternative to Reinforcement Learning from Human Feedback (RLHF) by directly solving for the optimal policy in closed form over preference pairs. However, DPO assumes a static implicit reward margin, causing it to over-penalize near-equivalent output pairs while struggling to emphasize substantial preference differences. In this study, we propose Adaptive Margin DPO (AM-DPO), which introduces a dynamic margin parameter adjusted by the semantic and length divergences of the prompt completions. We evaluate AM-DPO against standard DPO and PPO algorithms on standard dialogue and reasoning evaluations. Our findings indicate that AM-DPO significantly reduces model length bias (by 38%) and improves out-of-distribution reasoning accuracy by 4.8%. To maintain absolute scientific access, this report and its associated datasets are published under Creative Commons Attribution (CC BY 4.0) sharing terms, permitting free replication and redistribution without restriction.",
    sections: [
      {
        title: "1. Introduction",
        content: `Aligning Large Language Models with human preferences is crucial for ensuring helpfulness, honesty, and safety. Reinforcement Learning from Human Feedback (RLHF) historically relies on a multi-stage pipeline: training a reward model, followed by optimizing the actor model via Proximal Policy Optimization (PPO). PPO is notoriously unstable, sensitive to hyperparameters, and computationally expensive.

Direct Preference Optimization (DPO) bypassed PPO by showing that the maximum-likelihood optimization of a pairwise Bradley-Terry preference model can be solved directly on the policy network. The objective function of DPO is:

$$\\mathcal{L}_{DPO}(\\pi_\\theta; \\pi_{ref}) = -\\mathbb{E}_{(x, y_w, y_l) \\sim \\mathcal{D}} \\left[ \\log \\sigma \\left( \\beta \\log \\frac{\\pi_\\theta(y_w | x)}{\\pi_{ref}(y_w | x)} - \\beta \\log \\frac{\\pi_\\theta(y_l | x)}{\\pi_{ref}(y_l | x)} \\right) \\right]$$

Despite its elegance, standard DPO treats every preference pair with equal weight, regardless of whether $y_w$ is a massive improvement over $y_l$, or if they are virtually indistinguishable. This leads to two critical failure modes:
1. **Over-fitting on subtle completions**: The model wastes optimization capacity distinguishing between two high-quality completions.
2. **Length-bias exploitation**: Since longer completions often correlate with higher preference annotations in training data, standard DPO easily exploits length as a proxy for quality.

This paper addresses these limitations by modulating the preference threshold with an dynamic, metadata-driven margin regulator.`
      },
      {
        title: "2. Adaptive Margin Formulation",
        content: `We redefine the preference model to include a context-dependent margin $M(y_w, y_l)$:

$$P(y_w \\succ y_l | x) = \\sigma \\left( R(x, y_w) - R(x, y_l) - M(y_w, y_l) \\right)$$

Our proposed **Adaptive Margin Regulator** computes the margin dynamically as a function of completion length difference and embedding-level semantic similarity:

$$M(y_w, y_l) = \\gamma_1 \\cdot \\text{Sim}_{sem}(y_w, y_l) - \\gamma_2 \\cdot \\left| \\text{Len}(y_w) - \\text{Len}(y_l) \\right|$$

Where:
* $\\text{Sim}_{sem}$ represents the cosine similarity of the sequence embeddings.
* $\\text{Len}$ measures character counts.
* $\\gamma_1, \\gamma_2$ are scaling factors.

By raising the margin when samples are semantically similar, we prevent the model from updating weights destructively. Conversely, penalizing the margin for excessive length differences dampens length-bias optimization.`
      },
      {
        title: "3. Experimental Evaluation",
        content: `We validated AM-DPO using a 7B parameter LLaMA-2 foundation model on the UltraFeedback preference dataset.

### Length Bias Analysis
We measured the average length of preferred completions across training cycles.

* **Baseline DPO**: 342 words $\\rightarrow$ 612 words (extreme length inflation).
* **AM-DPO (Ours)**: 342 words $\\rightarrow$ 398 words (controlled growth).

### Benchmark Performances
We evaluated the models on AlpacaEval (win-rate against GPT-4) and GSM8K (math reasoning):

1. **Standard DPO**:
   - AlpacaEval Win Rate: 62.4% (inflated due to long responses)
   - GSM8K Accuracy: 54.2%
2. **AM-DPO (Ours)**:
   - AlpacaEval Win Rate: **68.1%** (consistently concise and informative)
   - GSM8K Accuracy: **59.0%**`
      },
      {
        title: "4. Ethical Considerations and Scientific Transparency",
        content: `Alignment processes often embed implicit cultural norms and commercial biases of the parent corporation. Closed alignment algorithms act as black boxes, making auditing for safety and social equity impossible.

By presenting this research transparently and eliminating paywalls and copyrights, we invite the global community to verify alignment protocols, audit the underlying preference margins, and deploy safer, democratically guided intelligent agents.`
      }
    ],
    references: [
      "Rafailov, R., et al. (2023). 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model.' NeurIPS 2023.",
      "Ouyang, L., et al. (2022). 'Training Language Models to Follow Instructions with Human Feedback.' NeurIPS 2022.",
      "Touvron, H., et al. (2023). 'Llama 2: Open Foundation and Fine-Tuned Chat Models.' Meta AI Technical Report.",
      "Cui, G., et al. (2023). 'UltraFeedback: A Large-Scale Resource for Fine-Grained RLHF.' arXiv preprint arXiv:2310.01377."
    ]
  },
  {
    id: "moe-semantic-modularization-2026",
    title: "Emergent Semantic Modularization in Sparsely-Gated Mixture of Experts",
    authors: [
      "Dr. Aris Thorne",
      "Kiran Patel"
    ],
    affiliations: [
      "Institute for Distributed Intelligence (IDI)",
      "Open Science Initiative for Intelligence (OSII)"
    ],
    date: "April 2026",
    doi: "10.5555/osii.2026.11029",
    category: "Architecture",
    abstract: "Sparsely-Gated Mixture of Experts (MoE) architectures have enabled model capacity scaling to trillions of parameters while keeping computational costs (FLOPs) fixed per token. However, the exact mechanism behind expert specialization, particularly the routing distribution across varying semantic tasks, is poorly understood. This paper studies the internal activation maps of an 8x22B Mixture of Experts model during prolonged instruct fine-tuning. We discover that instead of simple syntactic grouping, routing controllers exhibit emergent semantic clustering, allocating specific experts to distinct scientific reasoning sub-domains (e.g., Expert 3 for algorithmic logic, Expert 7 for chemistry/biological syntax). We present detailed mathematical proofs of routing entropy stabilization and offer visualization techniques for live debugging of active experts. In accordance with open-access mandates, this entire paper, visualization code, and model telemetry are hosted without copyrights or restrictions under Creative Commons Zero (CC0).",
    sections: [
      {
        title: "1. Introduction",
        content: `Mixture of Experts (MoE) models scale total network capacity without a corresponding increase in compute cost. In a typical MoE layer, several independent sub-networks (experts) are combined with a routing gate. During inference, each token is routed to only a subset of the experts (usually Top-1 or Top-2), maintaining a manageable active parameter count.

A major scientific question is: **Do experts specialize in meaningful ways, or do they perform arbitrary mathematical operations?**

Prior studies suggest that gating routers optimize for token frequency and load balancing, which can lead to disjointed, syntactic assignments (e.g., routing based on punctuation, verbs, or common pronouns). In this research, we demonstrate that as pre-training and fine-tuning progress, routers experience a phase transition where **emergent semantic specialization** overrides purely syntactic balancing.`
      },
      {
        title: "2. Routing Dynamics & Entropy Modulation",
        content: `Let $x$ be the input representation of a token. The router network computes a gating vector $G(x)$ of size $E$ (the number of experts):

$$G(x) = \\text{Softmax}\\left( \\text{KeepTopK}(x \\cdot W_g, K) \\right)$$

Where:
* $W_g$ represents the router's projection weights.
* $\\text{KeepTopK}$ sets all values below the $K$-th largest element to $-\\infty$.

To enforce fair load balancing, researchers commonly introduce an auxiliary balancing loss $\\mathcal{L}_{aux}$ based on routing entropy. We establish that when $\\mathcal{L}_{aux}$ is modulated dynamically during instruction tuning, the experts transition from general-purpose token handlers to domain-specific scientific specialists.

We track the expert specialization index $S_e$ defined as the KL-divergence of the token routing frequency under semantic domain prompts compared to flat random noise.`
      },
      {
        title: "3. Empirical Specialization Mapping",
        content: `We tracked the routing maps of an 8x22B parameter Mixture of Experts model on complex benchmark categories. 

Through semantic probing, we found clear structural division:
* **Expert 1**: Code syntax, loop constructs, variable definitions.
* **Expert 3**: Mathematical proofs, logical deduction, high-level physics.
* **Expert 5**: Humanistic dialog, translation nuances, contextual style.
* **Expert 7**: Scientific notation, biochemical structural formulas, data summaries.

### Expert Load Under Diverse Prompts
Our empirical telemetry indicates the active routing percentage per expert when queried with distinct prompt fields:

| Expert ID | Algorithmic Code | Biology/Medicine | Poetry/Creative |
| :---: | :---: | :---: | :---: |
| **Expert 1** | **84%** | 4% | 12% |
| **Expert 3** | **78%** | 15% | 7% |
| **Expert 5** | 2% | 8% | **90%** |
| **Expert 7** | 5% | **88%** | 7% |

This mapping demonstrates that the routing controller successfully groups tokens by high-level semantic representation, verifying structured cognitive specialization in the network.`
      },
      {
        title: "4. Conclusion & Scientific Openness",
        content: `Demystifying the 'black box' of routing systems is critical for safety auditing and optimization of generative intelligence. Locking these architectural insights behind commercial paywalls prevents rigorous independent audit and validation.

We dedicate this research and all active router visualization datasets to the public domain, enabling anyone to run, modify, and master MoE diagnostic systems.`
      }
    ],
    references: [
      "Shazeer, N., et al. (2017). 'Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer.' ICLR 2017.",
      "Fedus, W., et al. (2021). 'Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity.' arXiv:2101.03961.",
      "Du, N., et al. (2022). 'GLaM: Efficient Scaling of Language Models with Mixture-of-Experts.' ICML 2022.",
      "Jiang, A., et al. (2024). 'Mixtral of Experts.' arXiv:2401.04088."
    ]
  }
];
