import { useEffect, useState } from "react"
import { Container, Form, Table } from "react-bootstrap"

import { getShowCachedTranslations } from "~utils/functions/cachedTranslations"

import "~styles/globals.scss"

type Sentence = {
    original: string
    translated: string
}

export default function SentenceBrowser() {
    const [showId, setShowId] = useState<string | null>(null)
    const [targetLanguage, setTargetLanguage] = useState<string | null>(null)
    const [sentences, setSentences] = useState<Sentence[]>([])
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [filteredSentences, setFilteredSentences] = useState<Sentence[]>([])

    useEffect(() => {
        // Extract parameters from the URL
        const params = new URLSearchParams(window.location.search)
        setShowId(params.get("showId"))
        setTargetLanguage(params.get("targetLanguage"))
    }, [])

    useEffect(() => {
        const fetchSentences = async () => {
            if (!showId || !targetLanguage) {
                console.error("Missing showId or targetLanguage in URL.")
                return
            }

            // Fetch cached translations for the current show and target language
            const cachedTranslations = await getShowCachedTranslations(
                showId,
                targetLanguage
            )
            const allSentences: Sentence[] = []

            if (cachedTranslations) {
                Object.entries(cachedTranslations).forEach(
                    ([original, translated]) => {
                        allSentences.push({ original, translated })
                    }
                )
            }

            setSentences(allSentences)
            setFilteredSentences(allSentences)
        }

        fetchSentences()
    }, [showId, targetLanguage])

    useEffect(() => {
        const filtered = sentences.filter(
            (sentence) =>
                sentence.original
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                sentence.translated
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        )
        setFilteredSentences(filtered)
    }, [searchTerm, sentences])

    return (
        <Container className="mt-4">
            <h2>Sentence Browser</h2>
            <Form.Group className="mb-3" controlId="search">
                <Form.Label>Search Sentences</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Search by original or translated text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Form.Group>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Original Sentence</th>
                        <th>Translated Sentence</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSentences.map((sentence, index) => (
                        <tr key={index}>
                            <td>{sentence.original}</td>
                            <td>{sentence.translated}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    )
}
