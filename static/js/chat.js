
new Vue({
    el: '#app',
    data() {
        return {
            question: '',
            answers: ["lorem ipsum", "ipsum", "ipsum", "ipsum"]
        };
    },
    methods: {
        async askQuestion() {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: this.question }),
            });
            const { answer } = await res.json();
            this.answers.push(answer);
            this.question = '';
        }
    }
});

