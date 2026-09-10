/* ==========================
   home-slider.js
   Auto image slider (homepage)
   Checks only slide1.webp to slide15.webp
========================== */


        const SLIDER_FOLDER =
            "images/slider/";

        const MAX_SLIDES = 15;

        const SLIDE_INTERVAL =
            3000;

        const SLIDE_DURATION =
            800;


        let homeSlides = [];

        let homeCurrentSlide = 0;

        let homeSliderTimer = null;

        let homeSliderInitialized = false;


        function checkSliderImage(index) {

            return new Promise(function(resolve) {

                const image =
                    new Image();

                image.onload =
                    function() {

                        resolve({
                            index: index,
                            src:
                                SLIDER_FOLDER +
                                "slide" +
                                index +
                                ".webp"
                        });

                    };

                image.onerror =
                    function() {

                        resolve(null);

                    };

                image.src =
                    SLIDER_FOLDER +
                    "slide" +
                    index +
                    ".webp";

            });

        }


        async function loadHomeSlider() {

            const slider =
                document.getElementById(
                    "homeSlider"
                );

            const loading =
                document.getElementById(
                    "homeSliderLoading"
                );

            const dots =
                document.getElementById(
                    "homeSliderDots"
                );


            if (!slider) {
                return;
            }


            /*
             * Check only 1-15.
             *
             * All checks happen together,
             * not one after another.
             *
             * Therefore there is no
             * 1 -> 2 -> 3 -> ... -> 100
             * waiting process.
             */

            const checks = [];

            for (
                let i = 1;
                i <= MAX_SLIDES;
                i++
            ) {

                checks.push(
                    checkSliderImage(i)
                );

            }


            const results =
                await Promise.all(checks);


            homeSlides =
                results
                    .filter(Boolean)
                    .sort(
                        function(a, b) {
                            return a.index - b.index;
                        }
                    );


            if (loading) {
                loading.remove();
            }


            if (!homeSlides.length) {

                const empty =
                    document.createElement(
                        "div"
                    );

                empty.className =
                    "home-slider-empty";

                empty.textContent =
                    "কোনো Slider ছবি পাওয়া যায়নি।";

                slider.appendChild(empty);

                return;
            }


            /*
             * Create images.
             */

            homeSlides.forEach(
                function(slide, index) {

                    const image =
                        document.createElement(
                            "img"
                        );

                    image.className =
                        "home-slide" +
                        (
                            index === 0
                                ? " active"
                                : ""
                        );

                    image.src =
                        slide.src;

                    image.alt =
                        "আমাদের এলাকা Slide " +
                        (index + 1);

                    image.decoding =
                        "async";

                    /*
                     * First image loads immediately.
                     * Other images are already checked
                     * above, so browser can display
                     * them quickly during transitions.
                     */

                    if (index === 0) {
                        image.loading =
                            "eager";
                    } else {
                        image.loading =
                            "lazy";
                    }


                    slider.insertBefore(
                        image,
                        dots
                    );

                }
            );


            /*
             * Create dots.
             */

            if (dots) {

                dots.innerHTML = "";

                homeSlides.forEach(
                    function(slide, index) {

                        const dot =
                            document.createElement(
                                "button"
                            );

                        dot.type =
                            "button";

                        dot.className =
                            "home-slider-dot" +
                            (
                                index === 0
                                    ? " active"
                                    : ""
                            );

                        dot.setAttribute(
                            "aria-label",
                            "Slide " +
                            (index + 1)
                        );

                        dot.addEventListener(
                            "click",
                            function() {

                                showHomeSlide(
                                    index
                                );

                                startHomeSlider();

                            }
                        );

                        dots.appendChild(
                            dot
                        );

                    }
                );

                dots.style.display =
                    "flex";
            }


            homeSliderInitialized =
                true;


            if (homeSlides.length > 1) {

                startHomeSlider();

            }

        }


        function showHomeSlide(
            nextIndex
        ) {

            const slides =
                document.querySelectorAll(
                    ".home-slide"
                );

            const dots =
                document.querySelectorAll(
                    ".home-slider-dot"
                );


            if (
                !slides.length ||
                slides.length <= 1
            ) {
                return;
            }


            const oldIndex =
                homeCurrentSlide;


            const newIndex =
                (
                    nextIndex +
                    slides.length
                ) %
                slides.length;


            if (
                oldIndex === newIndex
            ) {
                return;
            }


            const currentSlide =
                slides[oldIndex];

            const nextSlide =
                slides[newIndex];


            /*
             * Current image goes left.
             */

            currentSlide.classList.remove(
                "active"
            );

            currentSlide.classList.add(
                "previous"
            );


            /*
             * Next image starts from right.
             */

            nextSlide.classList.add(
                "next-ready"
            );


            /*
             * Force browser to register
             * starting position before
             * moving it into place.
             */

            void nextSlide.offsetWidth;


            nextSlide.classList.remove(
                "next-ready"
            );

            nextSlide.classList.add(
                "active"
            );


            dots.forEach(
                function(dot, index) {

                    dot.classList.toggle(
                        "active",
                        index === newIndex
                    );

                }
            );


            homeCurrentSlide =
                newIndex;


            /*
             * Clean old slide after
             * animation completes.
             */

            setTimeout(
                function() {

                    currentSlide.classList.remove(
                        "previous"
                    );

                },
                SLIDE_DURATION
            );

        }


        function startHomeSlider() {

            stopHomeSlider();


            if (
                !homeSliderInitialized ||
                homeSlides.length <= 1
            ) {
                return;
            }


            homeSliderTimer =
                setInterval(
                    function() {

                        showHomeSlide(
                            homeCurrentSlide + 1
                        );

                    },
                    SLIDE_INTERVAL
                );

        }


        function stopHomeSlider() {

            if (homeSliderTimer) {

                clearInterval(
                    homeSliderTimer
                );

                homeSliderTimer =
                    null;

            }

        }


        document.addEventListener(
            "DOMContentLoaded",
            function() {

                loadHomeSlider();

            }
        );
