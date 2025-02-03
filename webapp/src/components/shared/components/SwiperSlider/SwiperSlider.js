import React from 'react'
import { Container, Box, Typography, Button, Grid, Card, CardContent, CardMedia, AppBar, Toolbar, Link } from '@mui/material';
import "./SwiperSlider.scss"

const SwiperSlider = (props) => {
    return (
        <>
            <swiper-container
                // class="mySwiper"
                // space-between="20"
                // centered-slides="false"
                // autoplay-delay="2500"
                // autoplay-disable-on-interaction="false"
                // slides-per-view={props?.sliderPerView}
                // speed="3000"
                // loop="true"

                class="mySwiper"
                space-between="30"
                slides-per-view={props?.sliderPerView}
                speed="3000"
                autoplay-disable-on-interaction="false"
                autoplay-delay={props.sliderData?.length>4 ? "2500" : null}
                loop={props.sliderData?.length>4 ? "true" : "false"}
                breakpoints='{"768": {"slidesPerView": 4}, "321": {"slidesPerView": 2}}'
            >

                {
                    props.sliderData?.map((slide, index) => (
                        <>
                            <swiper-slide key={index}>
                                <Grid item className='cardGrid'>
                                    <Card className='card-wrapper'>
                                        <img src={slide.logo} alt={slide.logo} />

                                        {slide.name ? <div className='card-content'>
                                            <CardContent className='card-content-wrapper'>
                                                <Typography className='body-detail' variant="h6">{slide.name}</Typography>
                                            </CardContent>
                                        </div> : null}
                                    </Card>
                                </Grid>
                            </swiper-slide>
                        </>
                    ))
                }


            </swiper-container>
        </>
    )
}

export default SwiperSlider