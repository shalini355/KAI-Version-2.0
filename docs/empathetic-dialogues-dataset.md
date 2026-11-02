# EmpatheticDialogues training data

The preparation script downloads the original EmpatheticDialogues archive from
[Facebook Research's ParlAI data host](https://dl.fbaipublicfiles.com/parlai/empatheticdialogues/empatheticdialogues.tar.gz)
and writes compressed chat fine-tuning files to
`datasets/empathetic_dialogues/`.

Run it from the repository root:

```powershell
python scripts\prepare_empathetic_dialogues.py
```

The generated `train.jsonl.gz`, `validation.jsonl.gz`, and `test.jsonl.gz` files
contain one assistant-turn example per JSONL line. Each example has a `messages`
array (`system`, conversation history, and assistant reply), plus the source
dataset, split, and conversation ID. Keep the provided splits separate when
training and evaluating.

This is an adaptation of the source CSVs: turns are grouped into chat-message
histories and a safety-limits system message is added. The original source
utterances are retained.

## Important limitations and terms

- This is an English, crowdsourced empathy-dialogue dataset, not a clinical
  counseling corpus. It can help explore empathetic conversational style; it
  does not teach or validate diagnosis, treatment, crisis response, or clinical
  accuracy.
- The source dataset is licensed
  [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Use and
  redistribution must follow that license, including attribution; commercial
  use is not permitted by this license. Check whether your intended training,
  deployment, and distribution comply before using it. The citation below
  identifies the source and this preparation changes the format and adds a
  system prompt.
- The conversations may include personal experiences. Do not treat this public
  dataset as proof of consent for unrelated uses, and do not combine it with
  users' private journal or chat data.
- The system message in each output example is a training prompt, not a safety
  guarantee. Keep KAI's runtime crisis guidance and professional-care
  limitations in place, and evaluate any model changes before deployment.

Dataset citation:

> Rashkin, Hannah, Eric Michael Smith, Margaret Li, and Y-Lan Boureau. “Towards
> Empathetic Open-domain Conversation Models: A New Benchmark and Dataset.”
> Proceedings of ACL, 2019. https://doi.org/10.18653/v1/P19-1534

Original dataset: [facebook/empathetic_dialogues on Hugging Face](https://huggingface.co/datasets/facebook/empathetic_dialogues).
